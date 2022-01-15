import path from "path";
import fs from "fs";
import FileHound from "filehound";

import { Compiler, javascript } from "webpack";
import { TextureItem, TextureModule } from "@uni.js/texture"
import jsStringEscape from "js-string-escape";

const ConstDependency = require("webpack/lib/dependencies/ConstDependency");
const { toConstantDependency } = require("webpack/lib/javascript/JavascriptParserHelpers");

const ReplacedExpression = "process.env.UNI_TEXTURE_LIST";
const PluginName = "UniTextureLoaderPlugin";

const PNG_MODULE_SUFFIX = ".module.png";
const JSON_MODULE_SUFFIX = ".module.json";

export function buildTextureList(contextPath: string, rootPath: string, rootDir: string): TextureModule[] {
	const fullPathRoot = path.resolve(contextPath, rootDir);

	const moduleFiles = FileHound.create().path(fullPathRoot).addFilter((file: any) => {
		return file.getName().endsWith(PNG_MODULE_SUFFIX) || file.getName().endsWith(JSON_MODULE_SUFFIX);
	}).findSync();

	const modules: TextureModule[] = [];
	for(const filePath of moduleFiles){
		const contextRelPath = path.relative(fullPathRoot, filePath);
		const url = path.join(rootPath, contextRelPath).split(path.sep).join("/");

		const fileBuffer = fs.readFileSync(filePath);
		if(filePath.endsWith(JSON_MODULE_SUFFIX)){
			modules.push(JSON.parse(fileBuffer.toString()));
		}else if(filePath.endsWith(PNG_MODULE_SUFFIX)){
			const name = path.basename(contextRelPath, PNG_MODULE_SUFFIX);
			const dirname = path.dirname(contextRelPath);
			const baseKey = dirname.split(path.sep).join(".");

			const textureItem: TextureItem = {
				url,
				relKey: name,
				fullKey: baseKey + "." + name,
				clipRect: {
					left: 0,
					top: 0,
					width: Infinity,
					height: Infinity
				},
			}
			
			modules.push({
				baseKey ,
				items: [ textureItem ]
			});
		}
	}

	return modules;
}

export interface PluginOption{
	rootDir: string;
	rootPath: string;
}

export class UniTextureLoaderPlugin{
	constructor(private options: PluginOption) {
		if(!this.options.rootDir) {
			throw new Error("rootDir must be provided");
		}
		if(!fs.existsSync(this.options.rootDir)){
			throw new Error("rootDir must exist.");
		}
	}

	apply(compiler: Compiler) {

		compiler.hooks.compilation.tap(PluginName, (compilation, { normalModuleFactory }) => {

			const publicPath = compilation.outputOptions.publicPath as string
			const moduleList = buildTextureList(compiler.context, this.options.rootPath, this.options.rootDir)
			const string = JSON.stringify(moduleList);
			const code = `'${jsStringEscape(string)}'`;
	
			compilation.dependencyTemplates.set(
				ConstDependency,
				new ConstDependency.Template()
			);

			const handler = (parser: javascript.JavascriptParser) => {
				parser.hooks.expression
				.for(ReplacedExpression)
				.tap(PluginName, (expr) => {
					return toConstantDependency(parser, code)(expr);
				});
			};
			
			const factoryParser = normalModuleFactory.hooks.parser;
			factoryParser.for("javascript/auto").tap(PluginName, handler);
			factoryParser.for("javascript/dynamic").tap(PluginName, handler);

		});
	}
}