import * as _ from "lodash";
import * as WebSocket from "ws";
export const META_KEY = "__$_meta_$___";

export const DIRECTION = {
    IN: "__in",
    OUT: "__in",
};

export interface GuardMetaData { direction: string; }
export type Guard = (model?: any, clientId?: string, ws?: WebSocket, metaData?: GuardMetaData) => boolean | Promise<boolean>;

export interface GuardMeta {
    key: string | symbol;
    guard: Guard;
}

export function guard(guardian: Guard): PropertyDecorator {
    return (target: any, key: string | symbol) => {
        applyGuards(guardian, target, key);
    };
}

function applyGuards(guardian: Guard, target: any, key: string | symbol) {
    if (_.isPlainObject(target[key])) {
        _.forEach(target[key], (__, k) => {
            applyGuards(guardian, target[key], k);
        });
    }

    applyGuard(guardian, target, key);
}


function applyGuard(guardian: Guard, target: any, key: string | symbol) {
    let meta = target[META_KEY];
    if (!meta) {
        target[META_KEY] = { guards: [] };
        meta = target[META_KEY];
    }
    if (!meta.guards) {
        meta.guards = [];
    }

    const g: GuardMeta = {
        key,
        guard: guardian,
    };
    meta.guards.push(g);
}