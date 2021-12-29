import { Entity, Property } from "../src/entity";
import { UniDatabase } from "../src/database"
import { Index } from "../src/indexes";


describe("collection test",() => {
    it("insert 100 and find", () => {        
        @Entity()
        class TestEntity{
            @Index()
            @Property()
            name: string;

            @Index()
            @Property()
            age: number;
        }

        const db = new UniDatabase();
        db.addCollection(TestEntity);
        const collection = db.collection(TestEntity);

        for(let i = 0; i  < 100; i++){
            collection.insertOne({
                name: "wyatt",
                age: i
            });
        }

        for(let i = 0; i < 100 ; i++){
            const results = collection.find({ age: i });
            expect(results.length).toBeGreaterThan(0);

            expect(results[0].age).toBe(i);
            expect(results[0].name).toBe("wyatt");

        }
        const results = collection.find({name: "wyatt"});
        expect(results.length).toBe(100);
    })

    it("update and find", () => {
        @Entity()
        class TestEntity{
            @Index()
            @Property()
            name: string;

            @Index()
            @Property()
            age: number;

            @Index()
            @Property()
            realAge: number;
        }

        const db = new UniDatabase();
        db.addCollection(TestEntity);
        const collection = db.collection(TestEntity);

        for(let i = 0; i  < 100; i++){
            collection.insertOne({
                name: "wyatt",
                age: i,
                realAge: i
            });
        }

        for(let i = 0; i < 100; i++){
            collection.findAndUpdate({
                name: "zhy",
                age: i + 1,
            },{
                realAge: i
            })
        }

        for(let i = 0; i < 100; i++){
            const results = collection.find({ realAge: i });
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].realAge).toBe(i);
            expect(results[0].age).toBe(i + 1);
            expect(results[0].name).toBe("zhy");
        }
        expect(collection.find({ name: "wyatt" }).length).toBe(0);
        expect(collection.find({ name: "zhy" }).length).toBe(100);
    })

    it("find and remove", () => {
        @Entity()
        class TestEntity{
            @Index()
            @Property()
            name: string;

            @Index()
            @Property()
            age: number;

            @Index()
            @Property()
            family: string;
        }

        const db = new UniDatabase();
        db.addCollection(TestEntity);
        const collection = db.collection(TestEntity);
        
        for(let i=0;i<50;i++){
            collection.insertOne({
                name: "jason",
                age: i,
                family: "family"
            })
        }
        
        for(let i=50;i<100;i++){
            collection.insertOne({
                name: "mark",
                age: i,
                family: "family"
            })
        }
        
        expect(collection.find({family: "family"}).length).toBe(100)
        collection.findAndRemove({ name: "jason" });
        expect(collection.find({family: "family"}).length).toBe(50)
        for(let i=50;i<100;i++){
            const results = collection.find({age: i});
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].name).toBe("mark");
            expect(results[0].age).toBe(i);
            expect(results[0].family).toBe("family");
        }
    });
    
    it("union index", () => {

        @Entity()
        @Index(["x", "y"])
        class GameObjectEntity{
            @Property()
            name: string;

            @Property()
            x: number;

            @Property()
            y: number;
        }

        const db = new UniDatabase();
        db.addCollection(GameObjectEntity);
        const collection = db.collection(GameObjectEntity);

        for(let i=50;i<100;i++){
            collection.insertOne({
                x: i,
                y: i * 2,
                name: i.toString()
            })
        }

        for(let i=50;i<100;i++){
            collection.findAndUpdate({
                x: i / 2,
                y: i,
                name: "modified" + i
            },{
                x: i,
                y: i * 2
            })
        }
    
        for(let i=50;i<100;i++){
            const results = collection.find({ x: i / 2, y: i })
            expect(results.length).toBe(1);
            expect(results[0].name).toBe("modified" + i);    

            expect(collection.find({ x: i , y: i * 2 }).length).toBe(0);
        }
    })
})