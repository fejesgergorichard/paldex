import { passivesService } from "@services/index";

export const execute = () => {

  const passives = passivesService.executePassives();

  return {
    content: passives,
    count: passives.length,
    total: passives.length,
  };
};
