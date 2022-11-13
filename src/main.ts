import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, Settings, SettingsTab } from './settings';

export default class PandocAdvanced extends Plugin {
    settings: Settings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new SettingsTab(this.app, this));
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
