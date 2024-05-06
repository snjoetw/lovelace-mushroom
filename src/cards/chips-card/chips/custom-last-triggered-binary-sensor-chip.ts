import {customElement} from "lit/decorators.js";
import {computeChipComponentName,} from "../../../utils/lovelace/chip/chip-element";
import {CustomTemplateChipConfig, LovelaceChip} from "../../../utils/lovelace/chip/types";
import {CustomTemplateChip} from "./custom-template-chip";


@customElement(computeChipComponentName("custom-last-triggered-binary-sensor"))
export class LastTriggeredBinarySensorChip extends CustomTemplateChip implements LovelaceChip {

    public setConfig(config: CustomTemplateChipConfig): void {
        const templateVariables = config.template_variables;
        config = {
            ...config,
            content: `
                {% set last_triggered_name = state_attr(entity, 'last_triggered_name') | replace(' Motion', '') | replace(' 2', '') %}
                {% set last_triggered = states[entity].last_changed %}

                {% if (now() - last_triggered) < timedelta(minutes=1) %}
                {% set last_triggered = 'now' %}
                {% else %}
                {% set last_triggered = relative_time(states[entity].last_changed) + ' ago' %}
                {% endif %}
                                
                {{ last_triggered_name }} • {{ last_triggered }}
            `,
            color: `
                {% set state = states(entity) %}
                {% if state == 'on' %}
                    {{ color_on }}
                {% else %}
                    grey
                {% endif %}
            `,
            template_variables: {
                ...templateVariables,
                color_on: config.color,
            }
        }
        super.setConfig(config)
    }

}
