import {css, CSSResultGroup, html, LitElement, nothing, TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {HomeAssistant,} from "../../../ha";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomTemperatureHumidityChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {HassEntity} from "home-assistant-js-websocket";

@customElement(computeChipComponentName("custom-temperature-humidity"))
export class CustomTemperatureHumidityChip extends LitElement implements LovelaceChip {

    @property({attribute: false}) public hass?: HomeAssistant;

    @state() private _config?: CustomTemperatureHumidityChipConfig;

    public setConfig(config: CustomTemperatureHumidityChipConfig): void {
        this._config = config;
    }

    protected render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        if (!this._config?.temperature && !this._config?.humidity) {
            return nothing;
        }

        return html`
            <mushroom-chip>
                ${this.renderIcon(this._config.icon)}
                <span>${this.figureContent()}</span>
            </mushroom-chip>
        `;
    }

    private figureContent() {
        if (this._config?.temperature && this._config?.humidity) {
            return this.figureEntityState(this._config.temperature) + '° • ' + this.figureEntityState(this._config.humidity) + '%';
        } else if (this._config?.temperature) {
            return this.figureEntityState(this._config.temperature) + '°';
        } else if (this._config?.humidity) {
            return this.figureEntityState(this._config.humidity) + '%';
        }
        return nothing;
    }

    private figureEntityState(entityId) {
        if (!this.hass || !entityId) {
            return null;
        }

        const stateObj = this.hass.states[entityId] as HassEntity | undefined;
        if (!stateObj) {
            return null;
        }

        return stateObj.state;
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
