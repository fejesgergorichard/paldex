import elasticunr from "elasticlunr";
import type { IPal } from "../common/interfaces";
import type { IPassive } from "@interfaces/passive.interface";

const palsFile = Bun.file("src/pals.json");
const passivesFile = Bun.file("src/passives.json");

const pals: IPal[] = await palsFile.json();
const passives: IPassive[] = await passivesFile.json();

const search = elasticunr<IPal>(function () {
  this.addField("types");
  this.addField("suitabilities");
  this.addField("name");
  this.addField("description");
  this.addField("drops");
  this.addField("key");
  this.setRef("id");
});

pals.forEach((pal) => {
  search.addDoc({
    ...pal,
    suitabilities: pal.suitability.map((suitability) => suitability.type),
  });
});

const execute = (query?: string) => {
  if (!query) return pals;
  const result = search.search(query);
  return pals.filter((pal) => result.some((item) => +item.ref === pal.id));
};

const executePassives = () => passives;

// export to import as elasticurnService
export const elasticurnService = { execute };
export const passivesService = { executePassives };
