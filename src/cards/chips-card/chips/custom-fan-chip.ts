import {customElement} from "lit/decorators.js";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomTemplateChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {CustomTemplateChip} from "./custom-template-chip";


@customElement(computeChipComponentName("custom-fan"))
export class CustomFanChip extends CustomTemplateChip implements LovelaceChip {

    public setConfig(config: CustomTemplateChipConfig): void {
        const templateVariables = config.template_variables;
        config = {
            ...config,
            color: `
              {% set state = states(entity) %}
              {% if state == 'on' %}
                {{ color_on }}
              {% elif state == 'off' %}
                grey
              {% else %}
                pink
              {% endif %}
            `,
            icon: `
              {% set state = states(entity) %}
              {% if state == 'on' %}
                {{ icon }}
              {% elif state == 'off' %}
                {{ icon }}-off
              {% else %}
                {{ icon }}-alert
              {% endif %}
            `,
            content: `
              {% set parts = [] %}
              {% if prefix is defined %}
                {% set parts = [prefix] %}
              {% endif %}

              {% set percentage = state_attr(entity, 'percentage') %}
              {% if percentage %}
                {% set parts = parts + [(percentage | string) + '%' ] %}
              {% endif %}
              
              {% set preset_mode = state_attr(entity, 'preset_mode') %}
              {% if preset_mode %}
                {% set parts = parts + [preset_mode] %}
              {% endif %}
              
              {{ parts | join(" • ") }}
            `,
            template_variables: {
                ...templateVariables,
                color_on: config.color || 'blue',
                icon: config.icon || 'mdi:fan',
            }
        }
        super.setConfig(config)
    }

}
