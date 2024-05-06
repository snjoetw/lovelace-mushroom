import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomBinarySensorChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {customElement, property, state} from "lit/decorators.js";
import {css, CSSResultGroup, html, LitElement, nothing} from "lit";
import {
    actionHandler,
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant
} from "../../../ha";
import {HassEntity} from "home-assistant-js-websocket";
import {styleMap} from "lit/directives/style-map.js";
import {computeInfoDisplay} from "../../../utils/info";
import {computeRgbColor} from "../../../utils/colors";


@customElement(computeChipComponentName("custom-binary-sensor"))
export class CustomBinarySensorChip extends LitElement implements LovelaceChip {

    private readonly DEFAULT_COLOR = 'grey';
    private readonly DEFAULT_COLOR_ON = 'red';

    @property({attribute: false}) public hass?: HomeAssistant;

    @state() private _config?: CustomBinarySensorChipConfig;

    public setConfig(config: CustomBinarySensorChipConfig): void {
        this._config = config;
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render() {
        if (!this.hass || !this._config || !this._config.entity) {
            return nothing;
        }

        const content = this.renderContent();
        const icon = this.renderIcon();
        const backgroundColor = this.figureColor();
        const chipStyle = {};
        if (backgroundColor) {
            const backgroundRgbColor = computeRgbColor(backgroundColor);
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

    private renderContent() {
        const content = this.figureContent()
        if (content == nothing) {
            return nothing;
        }

        const contentColor = this.figureColor();
        const contentStyle = {};
        if (contentColor) {
            const contentRgbColor = computeRgbColor(contentColor);
            contentStyle["--text-color"] = `rgb(${contentRgbColor})`;
        }
        return html`<span style=${styleMap(contentStyle)}>${content}</span>`;
    }

    private figureContent() {
        if (!this.hass || !this._config || !this._config.entity) {
            return nothing;
        }

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as HassEntity | undefined;
        if (!stateObj) {
            return nothing;
        }

        const content = this._config.content_info || 'none';
        if (content == 'none') {
            return nothing;
        }

        const name = this._config.name || stateObj.attributes.friendly_name || "";
        const stateDisplay = this.hass.formatEntityState
            ? this.hass.formatEntityState(stateObj)
            : computeStateDisplay(
                this.hass.localize,
                stateObj,
                this.hass.locale,
                this.hass.config,
                this.hass.entities
            );
        return computeInfoDisplay(
            content,
            name,
            stateDisplay,
            stateObj,
            this.hass
        );
    }

    private renderIcon() {
        const icon = this.figureIcon();
        if (!icon) {
            return nothing;
        }

        const iconColor = this.figureColor();
        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--color"] = `rgb(${iconRgbColor})`;
        }

        return html`
            <ha-state-icon
                    .hass=${this.hass}
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
            ></ha-state-icon>`;
    }

    private figureIcon() {
        if (!this.hass || !this._config || !this._config.entity) {
            return;
        }

        if (!this._config.icon && !this._config.icon_on && !this._config.icon_off) {
            return;
        }

        if (!this._config.icon_on && !this._config.icon_off) {
            return this._config.icon;
        }

        const stateObj = this.figureStateObject();
        if (!stateObj) {
            return;
        }

        const iconOn = this._config.icon_on || this._config.icon;
        const iconOff = this._config.icon_off || this._config.icon;

        return stateObj.state == 'on' ? iconOn : iconOff;
    }

    private figureColor() {
        if (!this.hass || !this._config || !this._config.entity) {
            return this.DEFAULT_COLOR;
        }

        const stateObj = this.figureStateObject();
        if (!stateObj) {
            return this.DEFAULT_COLOR;
        }
        const colorOn = this._config.color_on || this.DEFAULT_COLOR_ON;
        const colorOff = this._config.color_off || this._config.color || this.DEFAULT_COLOR;
        return stateObj.state == 'on' ? colorOn : colorOff;
    }

    private figureStateObject() {
        if (!this.hass || !this._config || !this._config.entity) {
            return;
        }
        const entityId = this._config.entity;
        return this.hass.states[entityId] as HassEntity | undefined;
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
