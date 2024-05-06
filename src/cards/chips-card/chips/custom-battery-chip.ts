import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomBatteryChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {customElement, property, state} from "lit/decorators.js";
import {css, CSSResultGroup, html, LitElement, nothing} from "lit";
import {actionHandler, ActionHandlerEvent, handleAction, hasAction, HomeAssistant} from "../../../ha";
import {HassEntity} from "home-assistant-js-websocket";
import {styleMap} from "lit/directives/style-map.js";
import {computeRgbColor} from "../../../utils/colors";


@customElement(computeChipComponentName("custom-battery"))
export class CustomBatteryChip extends LitElement implements LovelaceChip {

    @property({attribute: false}) public hass?: HomeAssistant;

    @state() private _config?: CustomBatteryChipConfig;

    public setConfig(config: CustomBatteryChipConfig): void {
        this._config = config;
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render() {
        if (!this.hass || !this._config || !this._config.entity) {
            return nothing;
        }

        const batteryLevel = this.figureBatteryLevel();
        const color = this.figureColor(batteryLevel);
        const content = this.renderContent(batteryLevel, color);
        const icon = this.renderIcon(batteryLevel, color);
        const chipStyle = {};
        if (color) {
            const backgroundRgbColor = computeRgbColor(color);
            chipStyle["--chip-background"] = `rgba(${backgroundRgbColor}, 0.1)`;
        }

        return html`
            <mushroom-chip
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config?.hold_action),
                        hasDoubleClick: hasAction(this._config?.double_tap_action),
                    })}
                    style=${styleMap(chipStyle)}
            >
                ${icon}
                ${content}
            </mushroom-chip>
        `;
    }

    private renderContent(batteryLevel: number | undefined, color: string) {
        const content = batteryLevel ? batteryLevel + '%' : 'NA';
        const contentStyle = {};
        if (color) {
            const contentRgbColor = computeRgbColor(color);
            contentStyle["--text-color"] = `rgb(${contentRgbColor})`;
        }
        return html`<span style=${styleMap(contentStyle)}>${content}</span>`;
    }

    private renderIcon(batteryLevel: number | undefined, color: string) {
        const icon = this.figureIcon(batteryLevel);
        if (!icon) {
            return nothing;
        }

        const iconStyle = {};
        if (color) {
            const iconRgbColor = computeRgbColor(color);
            iconStyle["--color"] = `rgb(${iconRgbColor})`;
        }

        return html`
            <ha-state-icon
                    .hass=${this.hass}
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
            ></ha-state-icon>`;
    }

    private figureIcon(batteryLevel: number | undefined) {
        if (!batteryLevel) {
            return 'mdi:battery-unknown';
        }

        if (batteryLevel >= 95) {
            return 'mdi:battery';
        } else if (batteryLevel >= 90) {
            return 'mdi:battery-90';
        } else if (batteryLevel >= 80) {
            return 'mdi:battery-80';
        } else if (batteryLevel >= 70) {
            return 'mdi:battery-70';
        } else if (batteryLevel >= 60) {
            return 'mdi:battery-60';
        } else if (batteryLevel >= 50) {
            return 'mdi:battery-50';
        } else if (batteryLevel >= 40) {
            return 'mdi:battery-40';
        } else if (batteryLevel >= 30) {
            return 'mdi:battery-30';
        } else if (batteryLevel >= 20) {
            return 'mdi:battery-20';
        } else if (batteryLevel >= 10) {
            return 'mdi:battery-10';
        } else {
            return 'mdi:battery-outline';
        }
    }

    private figureColor(batteryLevel: number | undefined) {
        if (!batteryLevel) {
            return 'grey';
        } else if (batteryLevel >= 70) {
            return 'green';
        } else if (batteryLevel >= 40) {
            return 'yellow';
        } else {
            return 'red';
        }
    }

    private figureStateObject() {
        if (!this.hass || !this._config || !this._config.entity) {
            return;
        }
        const entityId = this._config.entity;
        return this.hass.states[entityId] as HassEntity | undefined;
    }

    private figureBatteryLevel(): number | undefined {
        if (!this.hass || !this._config || !this._config.entity) {
            return;
        }

        const stateObj = this.figureStateObject();
        if (!stateObj) {
            return;
        }

        if (stateObj.entity_id.indexOf('battery') >= 0) {
            return this.toBatteryValue(stateObj.state);
        }

        for (const attribute_name in stateObj.attributes) {
            if (attribute_name.indexOf('battery') < 0) {
                continue;
            }

            const attribute = stateObj.attributes[attribute_name]
            return this.toBatteryValue(attribute);
        }

        return this.toBatteryValue(stateObj.state);
    }

    private toBatteryValue(raw): number | undefined {
        if (!raw) {
            return;
        }

        try {
            return Math.round(parseFloat(raw));
        } catch (_e) {
            return;
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
                --chip-background: rgba(187, 187, 187, 0.1);
            }

            ha-state-icon {
                color: var(--color);
            }
        `;
    }
}
