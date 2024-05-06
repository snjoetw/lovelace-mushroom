import {customElement} from "lit/decorators.js";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomTemplateChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {CustomTemplateChip} from "./custom-template-chip";


@customElement(computeChipComponentName("custom-climate"))
export class CustomClimateChip extends CustomTemplateChip implements LovelaceChip {

    public setConfig(config: CustomTemplateChipConfig): void {
        config = {
            ...config,
            color: `
              {% set hvac_action = state_attr(entity, 'hvac_action') %}
              {% if not is_state(entity, 'off') %}
                {% if hvac_action == 'fan' %}
                  yellow
                {% elif hvac_action == 'heating' %}
                  red
                {% elif hvac_action == 'cooling' %}
                  blue
                {% else %}
                  grey
                {% endif %}
              {% else %}
                grey
              {% endif %}
            `,
            icon: `
              {% set hvac_action = state_attr(entity, 'hvac_action') %}
              {% if not is_state(entity, 'off') %}
                {% if hvac_action == 'fan' %}
                  mdi:fan
                {% elif hvac_action == 'heating' %}
                  mdi:fire
                {% elif hvac_action == 'cooling' %}
                  mdi:snowflake
                {% else %}
                  mdi:home-thermometer
                {% endif %}
              {% else %}
                mdi:thermometer-off
              {% endif %}
            `,
            content: `
              {% set parts = [] %}
              {% if prefix is defined %}
                {% set parts = [prefix] %}
              {% endif %}

              {% set temperature = state_attr(entity, 'current_temperature') | string %}
              {% set humidity = state_attr(entity, 'current_humidity') | string %}
              {% set parts = parts + [temperature + '°', humidity + '%'] %}

              {% set climate_mode = state_attr(entity, 'climate_mode') | regex_replace('^E ', 'Early ') | regex_replace(' M$', ' (Master Bedroom)') %}
              {% if climate_mode and climate_mode != 'None' %}
                {% set parts = parts + [climate_mode] %}
              {% endif %}
              
              {{ parts | join(" • ") }}
            `
        }
        super.setConfig(config)
    }

}
