import {customElement} from "lit/decorators.js";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomTemplateChipConfig, EntityStateConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {CustomTemplateChip} from "./custom-template-chip";


@customElement(computeChipComponentName("custom-air-quality"))
export class CustomAirQualityChip extends CustomTemplateChip implements LovelaceChip {

    public setConfig(config: CustomTemplateChipConfig): void {
        config = {
            ...config,
            content: `
                {% set last_triggered_by = state_attr(entity, 'last_triggered_by') %}
                {% set state = states(entity) | replace('_', ' ') | title %}
                {% if room_name is defined %}
                    {% if state == 'Good' %}
                        {{ room_name }}
                    {% else %}
                        {{ room_name }} • {{ last_triggered_by }}
                    {% endif %}
                {% else %}
                    {% if state == 'Good' %}
                        {{ state }}
                    {% else %}
                        {{ state }} • {{ last_triggered_by }}
                    {% endif %}
                {% endif %}
            `
        }
        super.setConfig(config)
    }

    protected figureStateConfig(): EntityStateConfig | null {
        const state = this.figureEntityState();
        if (!state) {
            return null;
        }

        return {
            state: state,
            icon: 'mdi:weather-windy',
            color: this.figureStateColor(state),
        };
    }

    private figureStateColor(state): string {
        if (state == 'GOOD') {
            return 'green';
        } else if (state == 'FAIR') {
            return 'yellow';
        } else if (state == 'POOR') {
            return 'red';
        } else if (state == 'VERY_POOR') {
            return 'purple';
        }

        return 'pink';
    }

}
