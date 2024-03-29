import {
    Editor,
    MarkdownView,
    Notice,
    Plugin,
    TAbstractFile,
    TFile,
    stringifyYaml,
} from "obsidian";
import { DEFAULT_SETTINGS, Settings, SettingsTab } from "./settings";
import { promisify } from "util";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const execFile = promisify(require("child_process").execFile);

export default class PandocAdvanced extends Plugin {
    cwd: string;
    settings: Settings;

    prependDataDir(yaml: string): string {
        return (
            `data-dir: ${this.cwd}/${this.settings.configurationPath}\n` + yaml
        );
    }

    async execute(editor: Editor, view: MarkdownView) {
        let tempConfig = "";

        const args = [
            `${view.file.path}`,
            "--verbose",
            `--data-dir=${this.cwd}/${this.settings.configurationPath}`,
            `--resource-path=${this.cwd}:${this.cwd}/${this.settings.configurationPath}`,
        ];

        // if there is a pandoc section in the metadata, write it to a defaults
        // file and include it
        const metadata = this.app.metadataCache.getFileCache(view.file);
        if (metadata?.frontmatter?.pandoc) {
            const tempConfigName = `temp_${view.file.basename}.yaml`;
            tempConfig = `${this.settings.configurationPath}/defaults/${tempConfigName}`;

            args.push(`--defaults=${tempConfigName}`);

            await this.app.vault.adapter.write(
                tempConfig,
                this.prependDataDir(stringifyYaml(metadata.frontmatter.pandoc))
            );
        }

        try {
            const { stdout, stderr } = await execFile(
                this.settings.pandocPath,
                args,
                { cwd: this.cwd }
            );

            new Notice(`Pandoc Advanced:\n${stderr}`);

            if (stdout) {
                console.log(stdout);
            }
        } catch (error) {
            new Notice(`Pandoc Advanced:\n${error.message}`);
            throw error;
        }

        if (tempConfig) {
            await this.app.vault.adapter.remove(tempConfig);
        }

        new Notice("Pandoc Advanced: complete");
    }

    async vaultModify(abstractFile: TAbstractFile) {
        const file: TFile = abstractFile as TFile;

        const expectedPath = `${this.settings.configurationPath}/Pandoc.md`;
        if (file.path != expectedPath) {
            return;
        }

        // parse out codeblocks
        const contents = await this.app.vault.read(file);
        const lines = contents.split("\n");

        const filenameRegex = /^`(.+\.[a-zA-Z0-9]+)`$/;
        const codeBlockRegex = /^```[a-zA-Z]+$/;

        let saveFilename = "";
        let saveFileContents = "";

        for (const line of lines) {
            const filename = line.match(filenameRegex);
            if (filename) {
                saveFilename = filename[1];
                continue;
            }

            if (saveFilename && line.match(codeBlockRegex)) {
                continue;
            }

            if (saveFilename) {
                if (line.startsWith("```")) {
                    await this.app.vault.adapter.mkdir(
                        `${this.settings.configurationPath}/defaults`
                    );

                    await this.app.vault.adapter.write(
                        `${this.settings.configurationPath}/defaults/${saveFilename}`,
                        this.prependDataDir(saveFileContents)
                    );

                    saveFilename = "";
                    saveFileContents = "";
                } else {
                    saveFileContents += `${line}\n`;
                }
            }
        }

        new Notice("Pandoc Advanced: saved configuration");
    }

    async onload() {
        // @ts-ignore
        this.cwd = this.app.vault.adapter.getBasePath();

        await this.loadSettings();

        this.addSettingTab(new SettingsTab(this.app, this));

        this.registerEvent(
            this.app.vault.on("create", (file) => this.vaultModify(file))
        );
        this.registerEvent(
            this.app.vault.on("modify", (file) => this.vaultModify(file))
        );

        this.addCommand({
            id: "pandoc-advanced-execute",
            name: "Execute",
            editorCallback: (editor, view) => this.execute(editor, view),
        });
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
