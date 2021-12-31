import { UniServerPlugin, PluginContext, resolveServerSideModule } from "@uni.js/server"
import { UniMemoryDatabase } from "./database";

export function MemoryDatabasePlugin() : UniServerPlugin {
    return function(context: PluginContext) {
        const app = context.app;
        const option = app.getOption();
        const resolvedModule = resolveServerSideModule(option.module);
        const entities = resolvedModule.entities;

        const database = new UniMemoryDatabase(entities);        

        for(const entity of entities){
            app.add(entity, database.collection(entity));
        }

        app.add(UniMemoryDatabase, database);
    }
}