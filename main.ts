import {
  App,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  request,
  RequestParam,
  Setting,
} from "obsidian";

interface MyPluginSettings {
  apiUrl: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  apiUrl: "http://localhost:3000/annotate",
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  getSelectedText(cm: CodeMirror.Editor) {
    let selectedText: string;

    if (cm.somethingSelected()) {
      selectedText = cm.getSelection().trim();
      return selectedText;
    }
  }

  async annotateSelection() {
    const selection = this.getSelectedText(this.getEditor());
    const body = JSON.stringify({
      text: selection,
      annotators: ["helloLint"],
    });
    const RequestParam: RequestParam = {
      method: "POST",
      url: this.settings.apiUrl,
      contentType: "application/json",
      body,
    };
    const res = await request(RequestParam);
    console.log(res);
  }

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "annotate-selection",
      name: "Annotate Selection (helloLinter)",
      callback: () => this.annotateSelection(),
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private getEditor(): CodeMirror.Editor {
    let activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf.view instanceof MarkdownView) {
      return activeLeaf.view.sourceMode.cmEditor;
    } else throw new Error("activeLeaf.view not MarkdownView");
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText("Woah!");
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

    new Setting(containerEl)
      .setName("Setting #1")
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder("Enter your secret")
          .setValue("")
          .onChange(async (value) => {
            console.log("Secret: " + value);
            this.plugin.settings.apiUrl = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
