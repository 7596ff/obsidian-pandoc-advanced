import { App, PluginSettingTab, Setting } from "obsidian";
import PandocAdvanced from "./main";

export { DEFAULT_SETTINGS, SettingsTab };
export type { Settings };

interface Settings {
    pandocPath: string;
}

const DEFAULT_SETTINGS: Settings = {
    pandocPath: ''
}

class SettingsTab extends PluginSettingTab {
    plugin: PandocAdvanced;

    constructor(app: App, plugin: PandocAdvanced) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h1', { text: 'Pandoc Advanced' });

        new Setting(containerEl)
            .setName('Pandoc path')
            .setDesc('use `which pandoc` to find executable')
            .addText(text => text
                .setPlaceholder('pandoc')
                .setValue(this.plugin.settings.pandocPath)
                .onChange(async (value) => {
                    this.plugin.settings.pandocPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}