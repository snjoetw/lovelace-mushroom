import {css, CSSResultGroup, html, LitElement, nothing, TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {HomeAssistant,} from "../../../ha";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomMultiTemperaturesChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {HassEntity} from "home-assistant-js-websocket";

@customElement(computeChipComponentName("custom-multi-temperatures"))
export class CustomMultiTemperaturesChip extends LitElement implements LovelaceChip {

    @property({attribute: false}) public hass?: HomeAssistant;

    @state() private _config?: CustomMultiTemperaturesChipConfig;

    public setConfig(config: CustomMultiTemperaturesChipConfig): void {
        this._config = config;
    }

    protected render() {
        if (!this.hass || !this._config || !this._config.temperatures) {
            return nothing;
        }

        const temperatures = this._config.temperatures;
        const hass = this.hass;
        return html`
            <mushroom-chip>
                ${(temperatures).map((tempConfig) => {
                    const stateObj = hass.states[tempConfig.entity] as HassEntity | undefined;
                    const temperature = stateObj ? stateObj.state + "°" : "? ";
                    return html`
                        ${this.renderIcon(tempConfig.icon)}
                        <span>${temperature}</span>
                    `;
                })}
            </mushroom-chip>
        `;
    }

    renderIcon(
        icon: string | undefined,
    ): TemplateResult {
        return html`
            <ha-state-icon .icon=${icon}></ha-state-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
                --chip-background: rgba(187, 187, 187, 0.1);
            }
        `;
    }
}
