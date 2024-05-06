import {HassEntity} from "home-assistant-js-websocket";
import {css, CSSResultGroup, html, nothing, TemplateResult} from "lit";
import {customElement} from "lit/decorators.js";
import {classMap} from "lit/directives/class-map.js";
import {styleMap} from "lit/directives/style-map.js";
import {ActionConfig, actionHandler, ActionHandlerEvent, computeRTL, handleAction, LovelaceCard,} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import {computeAppearance} from "../../utils/appearance";
import {MushroomBaseCard} from "../../utils/base-card";
import {cardStyle} from "../../utils/card-styles";
import {registerCustomCard} from "../../utils/custom-cards";
import {CARD_BACKGROUND_OPACITY, ENTITY_CARD_NAME, ICON_BACKGROUND_OPACITY, ON_STATES} from "./const";
import {CustomUniversalEntityCardConfig} from "./custom-universal-entity-card-config";

registerCustomCard({
    type: ENTITY_CARD_NAME,
    name: "Mushroom Universal Entity Card",
    description: "Card for all entities",
});

@customElement(ENTITY_CARD_NAME)
export class CustomUniversalEntityCard extends MushroomBaseCard<CustomUniversalEntityCardConfig> implements LovelaceCard {

    protected render() {
        if (!this._config || !this.hass || !this._config.entity) {
            return nothing;
        }

        const stateObj = this._stateObj;
        if (!stateObj) {
            return this.renderNotFound(this._config);
        }

        const appearance = computeAppearance(this._config);
        const rtl = computeRTL(this.hass);
        const cardStyles = this.figureCardStyles(stateObj);

        return html`
            <ha-card class=${classMap({"fill-container": appearance.fill_container})} style=${styleMap(cardStyles)}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item
                            ?rtl=${rtl}
                            .appearance=${appearance}
                    >
                        ${this.renderIcon(stateObj)}
                        ${this.renderBadge(stateObj)}
                        ${this.renderContent(stateObj)}
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    private renderContent(stateObj: HassEntity): TemplateResult | null {
        const primary = this.figureEntityName(stateObj);
        const secondary = this.figureState(stateObj);
        const styles = this.figureContentStyles(stateObj);
        return html`
            <mushroom-state-info
                    slot="info"
                    .primary=${primary}
                    .secondary=${secondary}
                    style=${styleMap(styles)}
                    @action=${this.handleContentAction}
                    .actionHandler=${actionHandler()}
            ></mushroom-state-info>
        `;
    }

    private figureEntityName(stateObj: HassEntity) {
        let friendlyName = stateObj.attributes.friendly_name;
        const friendlyNameReplacements = this._config?.friendly_name_replacements;
        if (!friendlyNameReplacements || !friendlyName) {
            return friendlyName;
        }

        for (let key in friendlyNameReplacements) {
            let value = friendlyNameReplacements[key];
            friendlyName = friendlyName?.replace(new RegExp(key), value);
        }

        return friendlyName;
    }

    renderIcon(stateObj: HassEntity): TemplateResult {
        const icon = this.figureIcon(stateObj);
        const styles = this.figureIconStyles(stateObj);
        return html`
            <mushroom-shape-icon
                    slot="icon"
                    style=${styleMap(styles)}
                    @action=${this.handleIconAction}
                    .actionHandler=${actionHandler()}
            >
                <ha-state-icon
                        .hass=${this.hass}
                        .stateObj=${stateObj}
                        .state=${stateObj}
                        .icon=${icon}
                ></ha-state-icon>
            </mushroom-shape-icon>
        `;
    }

    private handleIconAction(ev: ActionHandlerEvent) {
        const entityId = this._config?.entity;
        const iconAction = this._config?.actions?.icon || {
            entity: entityId,
            tap_action: {
                target: {
                    entity_id: entityId,
                },
                ...this.figureIconTapAction(entityId)
            }
        };
        handleAction(this, this.hass!, iconAction!, ev.detail.action!);
    }

    figureIconTapAction(entityId): ActionConfig {
        if (entityId.startsWith('light.') || entityId.startsWith('switch.') || entityId.startsWith('fan.')) {
            return {
                action: "toggle",
            }
        } else if (entityId.startsWith("cover")) {
            return {
                action: "call-service",
                service: "cover.toggle",
            };
        } else if (entityId.startsWith("media_player")) {
            return {
                action: "call-service",
                service: "media_player.media_play_pause",
            };
        } else if (entityId.startsWith("humidifier")) {
            return {
                action: "call-service",
                service: "humidifier.toggle",
            };
        } else if (entityId.startsWith("lock")) {
            return {
                action: "call-service",
                service: this._stateObj?.state == "locked" ? "lock.unlock" : "lock.lock",
            };
        } else if (entityId.startsWith("input_button")) {
            return {
                action: "call-service",
                service: "input_button.press",
            };
        }

        return {
            action: "more-info",
        }
    }

    private handleContentAction(ev: ActionHandlerEvent) {
        const entityId = this._config?.entity;
        const contentAction = {
            entity: entityId,
            tap_action: {
                target: {
                    entity_id: entityId,
                },
                ...this.figureContentTapAction(entityId)
            }
        };
        handleAction(this, this.hass!, contentAction!, ev.detail.action!);
    }

    private figureContentTapAction(entityId): ActionConfig {
        if (entityId.startsWith("input_button")) {
            return {
                action: "call-service",
                service: "input_button.press",
            };
        }

        return {
            action: "more-info",
        }
    }

    private figureCardStyles(stateObj: HassEntity) {
        if (!stateObj) {
            return {};
        }

        const state = stateObj.state;
        const styles = {
            '--ha-card-border-radius': '12px',
            'padding': '10px 8px',
            ...this._config?.styles?.card,
        }

        let color = this.figureColor(stateObj);
        if (state == "playing") {
            const attributes = stateObj.attributes;
            const backgroundBlendMode = attributes.entity_picture ? "multiply" : "inherit";
            const background = attributes.entity_picture
                ? 'rgba(0,0,0,0.7) center / cover url(' + attributes.entity_picture + ')'
                : 'rgba(' + color + ',' + CARD_BACKGROUND_OPACITY + ')';
            return {
                ...styles,
                'background-blend-mode': backgroundBlendMode,
                'background': background,
            };
        }

        return {
            ...styles,
            'background-color': 'rgba(' + color + ',' + CARD_BACKGROUND_OPACITY + ')'
        };
    }

    private figureIcon(stateObj: HassEntity) {
        if (!stateObj) {
            return;
        }

        const entityId = stateObj.entity_id;
        const state = stateObj.state;
        const attributes = stateObj.attributes;
        if (entityId.startsWith('cover') && attributes.device_class == 'garage') {
            return (state == 'open' || state == 'opening') ? "mdi:garage-open" : "mdi:garage";
        } else if (entityId.startsWith('cover')) {
            return (state == 'open' || state == 'opening') ? "mdi:blinds-open" : "mdi:blinds";
        } else if (entityId.startsWith('fan') || entityId.endsWith('fan')) {
            return "mdi:fan";
        }
        return attributes.icon;
    }

    private figureIconStyles(stateObj: HassEntity) {
        if (!stateObj) {
            return {};
        }

        const color: string = this.figureColor(stateObj);
        const shouldDimColor = this.shouldDimColor(stateObj);
        const iconColor = shouldDimColor ? 'rgba(' + color + ',0.2)' : 'rgba(' + color + ',1)';
        const shapeColor = shouldDimColor ? 'rgba(' + color + ',0.05)' : 'rgba(' + color + ',' + ICON_BACKGROUND_OPACITY + ')';
        return {
            '--icon-color': iconColor,
            '--shape-color': shapeColor,
            ...this._config?.styles?.icon,
        }
    }

    private shouldDimColor(stateObj: HassEntity) {
        const entityId = stateObj.entity_id;
        const state = stateObj.state;
        const attributes = stateObj.attributes;
        return !entityId.startsWith('lock')
            && !(entityId.startsWith('cover') && attributes.device_class == 'garage')
            && !entityId.startsWith('input_button.')
            && ON_STATES.indexOf(state) < 0;
    }

    private figureState(stateObj: HassEntity) {
        if (!stateObj) {
            return "Unavailable";
        }

        const entityId = stateObj.entity_id;
        const state = stateObj.state;
        const attributes = stateObj.attributes;
        if (state == "unavailable") {
            return "Unavailable";
        } else if (entityId.startsWith("input_button")) {
            return null;
        } else if (state == "off") {
            return "Off";
        } else if (entityId.startsWith("vacuum.")) {
            return state + " • " + attributes.battery_level + "%";
        } else if (entityId.startsWith("media_player.")) {
            return attributes.media_album_name != null ? attributes.media_album_name : state;
        } else if (entityId.startsWith("fan.") || entityId.endsWith("_fan")) {
            if (attributes.percentage) {
                return attributes.percentage + "%";
            } else if (attributes.preset_mode) {
                return attributes.preset_mode.toLowerCase();
            }
            return state;
        } else if (ON_STATES.indexOf(state) >= 0) {
            if (attributes.brightness != null) {
                const brightness = Math.ceil(attributes.brightness / 255 * 100);
                return (brightness ? brightness : "0") + "%";
            } else if (attributes.current_position != null) {
                return attributes.current_position + "%";
            }
        }
        return state;
    }

    private figureContentStyles(stateObj: HassEntity) {
        if (!stateObj) {
            return {};
        }

        const baseColor: string = this.figureColor(stateObj);
        const color = this.shouldDimColor(stateObj) ? 'rgba(' + baseColor + ',0.7)' : 'rgba(' + baseColor + ',1)';

        return {
            '--card-primary-color': color,
            '--card-primary-font-weight': 'bold',
            '--card-secondary-color': color,
            '--card-secondary-font-weight': 'bolder',
            '--card-secondary-filter': 'opacity(40%)',
            ...this._config?.styles?.content
        }
    }

    private figureColor(stateObj: HassEntity) {
        if (!stateObj) {
            return;
        }

        const entityId = stateObj.entity_id;
        const state = stateObj.state;
        const attributes = stateObj.attributes;

        if (entityId.startsWith('lock') || (entityId.startsWith('cover') && attributes.device_class == 'garage')) {
            return (ON_STATES.indexOf(state) >= 0) ? 'var(--color-red)' : 'var(--color-green)';
        } else if (entityId.startsWith('input_button.')) {
            return 'var(--color-grey)';
        } else if (entityId.startsWith('media_player') || entityId.startsWith('vacuum')) {
            return (ON_STATES.indexOf(state) >= 0) ? 'var(--color-green)' : 'var(--color-grey)';
        } else if (ON_STATES.indexOf(state) < 0) {
            return 'var(--color-grey)';
        } else if (attributes.rgb_color) {
            return attributes.rgb_color;
        } else if (entityId.startsWith('fan') || entityId.endsWith('fan')) {
            return 'var(--color-blue)';
        }

        return 'var(--color-yellow)'
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
            `,
        ];
    }
}
