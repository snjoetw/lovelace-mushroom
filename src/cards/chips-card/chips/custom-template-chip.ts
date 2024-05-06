import {HassEntity, UnsubscribeFunc} from "home-assistant-js-websocket";
import {css, CSSResultGroup, html, LitElement, nothing, PropertyValues, TemplateResult,} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {styleMap} from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    RenderTemplateResult,
    subscribeRenderTemplate,
} from "../../../ha";
import {computeRgbColor} from "../../../utils/colors";
import {getWeatherSvgIcon} from "../../../utils/icons/weather-icon";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomTemplateChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {weatherSVGStyles} from "../../../utils/weather";

const TEMPLATE_KEYS = ["content", "icon", "icon_color", "picture", "content_color", "background_color", "color"] as const;
type TemplateKey = (typeof TEMPLATE_KEYS)[number];

@customElement(computeChipComponentName("custom-template"))
export class CustomTemplateChip extends LitElement implements LovelaceChip {

    @property({attribute: false}) public hass?: HomeAssistant;

    public getConfig(): CustomTemplateChipConfig | undefined {
        return this._config;
    }

    private _config?: CustomTemplateChipConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<TemplateKey, Promise<UnsubscribeFunc>> = new Map();

    protected _templateKeys;

    public setConfig(config: CustomTemplateChipConfig): void {
        this._templateKeys = TEMPLATE_KEYS;
        this._templateKeys.forEach((key) => {
            if (this.getConfig()?.[key] !== config[key] || this.getConfig()?.entity != config.entity) {
                this._tryDisconnectKey(key);
            }
        });
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    public connectedCallback() {
        super.connectedCallback();
        this._tryConnect();
    }

    public disconnectedCallback() {
        this._tryDisconnect();
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this.getConfig()!, ev.detail.action!);
    }

    public isTemplate(key: TemplateKey) {
        const value = this.getConfig()?.[key];
        return value?.includes("{");
    }

    private getValue(key: TemplateKey, defaultValue?: null | string, stateConfig?) {
        if (stateConfig && key in stateConfig) {
            return stateConfig[key];
        }

        const value = this.isTemplate(key)
            ? this._templateResults[key]?.result?.toString()
            : this.getConfig()?.[key];
        return value ? value : defaultValue;
    }

    protected figureStateConfig() {
        if (!this.hass || !this.getConfig()) {
            return null;
        }

        if (!this.getConfig()?.states) {
            return null;
        }

        const state = this.figureEntityState();
        if (!state) {
            return null;
        }

        return this.getConfig()?.states?.find(c => c.state == state);
    }

    protected figureEntityState() {
        if (!this.hass || !this.getConfig()) {
            return null;
        }

        const entityId = this.getConfig()?.entity;
        if (!entityId) {
            return null;
        }

        const stateObj = this.hass.states[entityId] as HassEntity | undefined;
        if (!stateObj) {
            return null;
        }

        return stateObj.state;
    }

    protected render() {
        if (!this.hass || !this.getConfig()) {
            return nothing;
        }

        const icon = this.figureIcon();
        const iconColor = this.figureIconColor();
        const contentColor = this.figureContentColor();
        const backgroundColor = this.figureBackgroundColor()
        const content = this.figureContent();
        const picture = this.figurePicture();

        const rtl = computeRTL(this.hass);
        const weatherSvg = getWeatherSvgIcon(icon);
        const chipStyle = {};

        if (backgroundColor) {
            const backgroundRgbColor = computeRgbColor(backgroundColor);
            chipStyle["--chip-background"] = `rgba(${backgroundRgbColor}, 0.1)`;
        }

        return html`
            <mushroom-chip
                    ?rtl=${rtl}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this.getConfig()?.hold_action),
                        hasDoubleClick: hasAction(this.getConfig()?.double_tap_action),
                    })}
                    .avatar=${picture ? (this.hass as any).hassUrl(picture) : undefined}
                    .avatarOnly=${picture && !content}
                    style=${styleMap(chipStyle)}
            >
                ${!picture
                        ? weatherSvg
                                ? weatherSvg
                                : icon
                                        ? this.renderIcon(icon, iconColor)
                                        : nothing
                        : nothing}
                ${content ? this.renderContent(content, contentColor) : nothing}
            </mushroom-chip>
        `;
    }

    protected figureIcon() {
        const stateConfig = this.figureStateConfig();
        return this.getValue("icon", null, stateConfig);
    }

    protected figurePicture() {
        const stateConfig = this.figureStateConfig();
        return this.getValue("picture", null, stateConfig);
    }

    protected figureContent() {
        const stateConfig = this.figureStateConfig();
        return this.getValue("content", null, stateConfig);
    }

    protected figureBackgroundColor() {
        const stateConfig = this.figureStateConfig();
        const chipColor = this.getValue("color", null, stateConfig);
        return this.getValue("background_color", chipColor, stateConfig);
    }

    protected figureContentColor() {
        const stateConfig = this.figureStateConfig();
        const chipColor = this.getValue("color", null, stateConfig);
        return this.getValue("content_color", chipColor, stateConfig);
    }

    protected figureIconColor() {
        const stateConfig = this.figureStateConfig();
        const chipColor = this.getValue("color", null, stateConfig);
        return this.getValue("icon_color", chipColor, stateConfig);
    }

    protected renderIcon(icon: string, iconColor?: string): TemplateResult {
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

    protected renderContent(content: string, contentColor?: string): TemplateResult {
        const contentStyle = {};
        if (contentColor) {
            const contentRgbColor = computeRgbColor(contentColor);
            contentStyle["--text-color"] = `rgb(${contentRgbColor})`;
        }
        return html`<span style=${styleMap(contentStyle)}>${content}</span>`;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (!this.getConfig() || !this.hass) {
            return;
        }

        this._tryConnect();
    }

    private async _tryConnect(): Promise<void> {
        this._templateKeys.forEach((key) => {
            this._tryConnectKey(key);
        });
    }

    private async _tryConnectKey(key: TemplateKey): Promise<void> {
        const config = this.getConfig();
        if (
            this._unsubRenderTemplates.get(key) !== undefined ||
            !this.hass ||
            !config ||
            !this.isTemplate(key)
        ) {
            return;
        }

        try {
            const sub = subscribeRenderTemplate(
                this.hass.connection,
                (result) => {
                    this._templateResults = {
                        ...this._templateResults,
                        [key]: result,
                    };
                },
                {
                    template: config[key] ?? "",
                    entity_ids: config.entity_id,
                    variables: {
                        config: config,
                        user: this.hass.user!.name,
                        entity: config.entity,
                        ...config.template_variables
                    },
                    strict: true,
                }
            );
            this._unsubRenderTemplates.set(key, sub);
            await sub;
        } catch (_err) {
            const result = {
                result: config[key] ?? "",
                listeners: {
                    all: false,
                    domains: [],
                    entities: [],
                    time: false,
                },
            };
            this._templateResults = {
                ...this._templateResults,
                [key]: result,
            };
            this._unsubRenderTemplates.delete(key);
        }
    }

    private async _tryDisconnect(): Promise<void> {
        this._templateKeys.forEach((key) => {
            this._tryDisconnectKey(key);
        });
    }

    private async _tryDisconnectKey(key: TemplateKey): Promise<void> {
        const unsubRenderTemplate = this._unsubRenderTemplates.get(key);
        if (!unsubRenderTemplate) {
            return;
        }

        try {
            const unsub = await unsubRenderTemplate;
            unsub();
            this._unsubRenderTemplates.delete(key);
        } catch (err: any) {
            if (err.code === "not_found" || err.code === "template_error") {
                // If we get here, the connection was probably already closed. Ignore.
            } else {
                throw err;
            }
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
            }

            ha-state-icon {
                color: var(--color);
            }

            ${weatherSVGStyles}
        `;
    }
}
