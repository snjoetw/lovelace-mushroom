import {ActionsSharedConfig} from "../../shared/config/actions-config";
import {AppearanceSharedConfig,} from "../../shared/config/appearance-config";
import {EntitySharedConfig} from "../../shared/config/entity-config";
import {LovelaceCardConfig} from "../../ha";

export type CustomUniversalEntityCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig & {
    icon_color?: string;
    styles?: CustomUniversalEntityCardStylesConfig;
    actions?: CustomUniversalEntityCardActionsConfig;
    friendly_name_replacements?: {};
};

export type CustomUniversalEntityCardStylesConfig = {
    card?: {};
    icon?: {};
    content?: {};
};

export type CustomUniversalEntityCardActionsConfig = {
    card?: ActionsSharedConfig;
    icon?: ActionsSharedConfig;
    content?: ActionsSharedConfig;
};
