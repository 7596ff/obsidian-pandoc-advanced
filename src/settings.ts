import { App, PluginSettingTab, Setting } from "obsidian";
import PandocAdvanced from "./main";

export { DEFAULT_SETTINGS, SettingsTab };
export type { Settings };

interface Settings {
    configurationPath: string;
    pandocPath: string;
}

const DEFAULT_SETTINGS: Settings = {
    configurationPath: "",
    pandocPath: "",
};

class SettingsTab extends PluginSettingTab {
    plugin: PandocAdvanced;

    constructor(app: App, plugin: PandocAdvanced) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h1", { text: "Pandoc Advanced" });

        new Setting(containerEl)
            .setName("Pandoc path")
            .setDesc("use `which pandoc` to find executable")
            .addText((text) =>
                text
                    .setPlaceholder("pandoc")
                    .setValue(this.plugin.settings.pandocPath)
                    .onChange(async (value) => {
                        this.plugin.settings.pandocPath = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Configuration path (in Vault)")
            .setDesc(
                "This folder will contain the Pandoc.md configuration file as well as all generated configuration and static templates"
            )
            .addText((text) =>
                text
                    .setPlaceholder("Pandoc")
                    .setValue(this.plugin.settings.configurationPath)
                    .onChange(async (value) => {
                        if (value.endsWith("/")) {
                            this.plugin.settings.configurationPath =
                                value.substring(0, value.length - 1);
                        } else {
                            this.plugin.settings.configurationPath = value;
                        }

                        await this.plugin.saveSettings();
                    })
            );
    }
}
