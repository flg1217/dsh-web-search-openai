window.__ModuleLoader__.load({
  id: "@dsh-external/dsh-web-search-openai",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name2 in all)
        __defProp(target, name2, { get: all[name2], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // src/client/index.tsx
    var index_exports = {};
    __export(index_exports, {
      SearchSettingsController: () => SearchSettingsController,
      SearchSettingsSection: () => SearchSettingsSection,
      WEB_SEARCH_OPENAI_NS: () => WEB_SEARCH_OPENAI_NS,
      apply: () => apply,
      inject: () => inject,
      name: () => name
    });
    module.exports = __toCommonJS(index_exports);
    var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
    var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");
    var import_jsx_runtime = require("react/jsx-runtime");
    var WEB_SEARCH_OPENAI_NS = "web-search-openai";
    var CSS = {
      card: ".dshOpenai_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}",
      cardHover: ".dshOpenai_card:hover{border-color:var(--dsw-alias-label-dimmed)}",
      cardOpen: ".dshOpenai_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}",
      header: ".dshOpenai_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}",
      headerFocus: ".dshOpenai_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}",
      headText: ".dshOpenai_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}",
      name: ".dshOpenai_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}",
      description: ".dshOpenai_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}",
      chevron: ".dshOpenai_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}",
      chevronOpen: ".dshOpenai_chevronOpen{transform:rotate(180deg)}",
      body: ".dshOpenai_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}",
      page: ".dshOpenai_page{display:flex;flex-direction:column}",
      field: ".dshOpenai_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}",
      fieldTop: ".dshOpenai_field+.dshOpenai_field{border-top:1px solid var(--dsw-alias-border-l2)}",
      fieldHead: ".dshOpenai_fieldHead{align-items:center;gap:8px;display:flex}",
      label: ".dshOpenai_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}",
      hint: ".dshOpenai_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}",
      input: ".dshOpenai_input{display:flex;width:100%;min-width:0;box-sizing:border-box}.dshOpenai_input input{flex:1;min-width:0;width:100%;box-sizing:border-box}",
      row: ".dshOpenai_row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0}"
    };
    var cssText = Object.values(CSS).join("");
    var tagId = "@dsh-external/web-search-openai/card.css";
    if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@dsh-external/web-search-openai";
      tag.dataset.pluginCss = tagId;
      tag.textContent = cssText;
      document.head.appendChild(tag);
    }
    var C = {
      card: "dshOpenai_card",
      cardOpen: "dshOpenai_cardOpen",
      header: "dshOpenai_header",
      headText: "dshOpenai_headText",
      name: "dshOpenai_name",
      description: "dshOpenai_description",
      chevron: "dshOpenai_chevron",
      chevronOpen: "dshOpenai_chevronOpen",
      body: "dshOpenai_body",
      page: "dshOpenai_page",
      field: "dshOpenai_field",
      fieldHead: "dshOpenai_fieldHead",
      label: "dshOpenai_label",
      hint: "dshOpenai_hint",
      input: "dshOpenai_input",
      row: "dshOpenai_row"
    };
    function SearchSettingsSection({ view, useSearchSettings, edit, save, reload, clearKey }) {
      if (view === "summary") return "OpenAI Responses API \u641C\u7D22\u63D0\u4F9B\u65B9(web_search \u5DE5\u5177)";
      const state = useSearchSettings((value) => value);
      const disabled = !state.writable || state.saving;
      const field = (label, control, hint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: C.field, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: C.fieldHead, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: C.label, children: label }) }),
        control,
        hint !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: C.hint, children: hint }) : null
      ] });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: C.page, children: [
        state.failed !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: "10px 12px", borderRadius: 10, fontSize: 12, background: "rgba(205,72,72,.1)", color: "#aa3939" }, children: state.failed }) : null,
        state.savedAt !== void 0 && state.failed === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: "10px 12px", borderRadius: 10, fontSize: 12, background: "rgba(48,154,100,.1)", color: "#267d52" }, children: "\u5DF2\u4FDD\u5B58\u5E76\u751F\u6548\u3002" }) : null,
        field(
          "\u670D\u52A1\u5730\u5740",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Input, { className: C.input, value: state.draft.baseURL, disabled, onChange: (event) => {
            edit("baseURL", event.target.value);
          } }),
          "OpenAI \u517C\u5BB9\u7AEF\u70B9\uFF1B\u9ED8\u8BA4 https://api.openai.com/v1"
        ),
        field(
          "\u6A21\u578B",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Input, { className: C.input, value: state.draft.model, disabled, onChange: (event) => {
            edit("model", event.target.value);
          } })
        ),
        field(
          "API Key(\u53EF\u9009)",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Input, { className: C.input, type: "password", value: state.draft.apiKey, disabled, onChange: (event) => {
            edit("apiKey", event.target.value);
          } }),
          "\u7559\u7A7A\u4FDD\u5B58\u4E0D\u4F1A\u6539\u52A8\u5DF2\u5B58\u5BC6\u94A5;\u6E05\u9664\u8BF7\u7528\u4E0B\u65B9\u6309\u94AE"
        ),
        field(
          "\u6700\u5927\u8F93\u51FA tokens",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Input, { className: C.input, inputMode: "numeric", value: state.draft.maxTokens, disabled, onChange: (event) => {
            edit("maxTokens", event.target.value);
          } })
        ),
        field(
          "search_context_size",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Input, { className: C.input, value: state.draft.searchContextSize, disabled, onChange: (event) => {
            edit("searchContextSize", event.target.value);
          } }),
          "\u68C0\u7D22\u65F6\u5582\u7ED9\u6A21\u578B\u7684\u7F51\u9875\u4E0A\u4E0B\u6587\u91CF(\u5B98\u65B9\u503C low/medium/high,\u53EF\u81EA\u5B9A\u4E49)"
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: C.row, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: disabled || !state.dirty, onClick: save, children: state.saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u5E76\u5E94\u7528" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled, onClick: reload, children: "\u91CD\u65B0\u52A0\u8F7D" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled, onClick: clearKey, children: "\u6E05\u9664 API Key" })
        ] })
      ] });
    }
    function draftOf(value) {
      return {
        baseURL: value?.baseURL ?? "https://api.openai.com/v1",
        apiKey: "",
        model: value?.model ?? "gpt-5.6-luna",
        maxTokens: String(value?.maxTokens ?? 128e3),
        searchContextSize: value?.searchContextSize ?? "medium"
      };
    }
    function dirtyOf(draft, value) {
      return draft.baseURL.trim() !== (value?.baseURL ?? "https://api.openai.com/v1") || draft.model.trim() !== (value?.model ?? "gpt-5.6-luna") || draft.maxTokens.trim() !== String(value?.maxTokens ?? 128e3) || draft.searchContextSize !== (value?.searchContextSize ?? "medium") || draft.apiKey.trim().length > 0;
    }
    var SearchSettingsController = class {
      /**
       * @param scope - the bound settings scope for the `web-search-openai` namespace.
       */
      constructor(scope) {
        this.scope = scope;
        this.draft = draftOf(this.scope.getSnapshot().value);
        this.store = (0, import_dsh_client_store.createSnapshotStore)(this.project());
        this.scope.subscribe(() => {
          if (!this.saving) this.draft = draftOf(this.scope.getSnapshot().value);
          this.publish();
        });
      }
      draft;
      saving = false;
      failed;
      savedAt;
      store;
      /** Build the face the card's slot registration injects. */
      inject() {
        return {
          hooks: { searchSettings: this.store },
          edit: (field, text) => {
            this.draft = { ...this.draft, [field]: text };
            this.publish();
          },
          save: () => {
            void this.save();
          },
          reload: () => {
            this.draft = draftOf(this.scope.getSnapshot().value);
            this.failed = void 0;
            this.publish();
          },
          clearKey: () => {
            void this.clearKey();
          }
        };
      }
      /**
       * Write every staged edit, then re-seed from what the Host accepted. The API
       * key is write-only: a blank field never clears it (that is {@link clearKey}'s
       * job), and a non-blank field always writes. An invalid numeric field aborts
       * the whole save and keeps the draft.
       */
      async save() {
        const snapshot = this.scope.getSnapshot();
        if (!snapshot.writable || this.saving) return;
        this.saving = true;
        this.failed = void 0;
        this.publish();
        try {
          const value = snapshot.value;
          const writes = [];
          const baseURL = this.draft.baseURL.trim();
          if (baseURL !== (value?.baseURL ?? "https://api.openai.com/v1")) {
            writes.push(baseURL.length > 0 ? this.scope.set("baseURL", baseURL) : this.scope.unset("baseURL"));
          }
          const apiKey = this.draft.apiKey.trim();
          if (apiKey.length > 0) writes.push(this.scope.set("apiKey", apiKey));
          const model = this.draft.model.trim();
          if (model !== (value?.model ?? "gpt-5.6-luna")) {
            writes.push(model.length > 0 ? this.scope.set("model", model) : this.scope.unset("model"));
          }
          const maxTokensRaw = this.draft.maxTokens.trim();
          if (maxTokensRaw.length === 0) {
            if (value?.maxTokens !== void 0) writes.push(this.scope.unset("maxTokens"));
          } else {
            const maxTokens = Number(maxTokensRaw);
            if (!Number.isSafeInteger(maxTokens) || maxTokens <= 0) throw new Error("\u6700\u5927\u8F93\u51FA tokens \u5FC5\u987B\u662F\u6B63\u6574\u6570");
            if (maxTokens !== (value?.maxTokens ?? 128e3)) writes.push(this.scope.set("maxTokens", maxTokens));
          }
          if (this.draft.searchContextSize !== (value?.searchContextSize ?? "medium")) {
            writes.push(this.scope.set("searchContextSize", this.draft.searchContextSize));
          }
          await Promise.all(writes);
          this.savedAt = Date.now();
        } catch (error) {
          this.failed = error instanceof Error ? error.message : String(error);
        } finally {
          this.saving = false;
          if (this.failed === void 0) this.draft = draftOf(this.scope.getSnapshot().value);
          this.publish();
        }
      }
      /** Clear the stored API key through the scope, then re-seed. */
      async clearKey() {
        const snapshot = this.scope.getSnapshot();
        if (!snapshot.writable || this.saving) return;
        try {
          await this.scope.unset("apiKey");
          this.savedAt = Date.now();
        } catch (error) {
          this.failed = error instanceof Error ? error.message : String(error);
        }
        this.draft = draftOf(this.scope.getSnapshot().value);
        this.publish();
      }
      project() {
        const snapshot = this.scope.getSnapshot();
        return {
          available: snapshot.status === "ready",
          writable: snapshot.writable,
          saving: this.saving,
          dirty: dirtyOf(this.draft, snapshot.value),
          failed: this.failed,
          savedAt: this.savedAt,
          draft: this.draft
        };
      }
      publish() {
        this.store.set(this.project());
      }
    };
    var name = "web-search-openai-client";
    var inject = ["slots", "configForms"];
    function apply(ctx) {
      const controller = new SearchSettingsController(ctx.configForms.get(WEB_SEARCH_OPENAI_NS));
      ctx.slots.inject("plugins.item", () => ctx.slots.register({
        name: "plugins.item",
        id: "web-search-openai",
        order: 45,
        label: () => "OpenAI \u641C\u7D22",
        inject: () => controller.inject()
      }, SearchSettingsSection));
    }
    return module.exports;
  }
});
