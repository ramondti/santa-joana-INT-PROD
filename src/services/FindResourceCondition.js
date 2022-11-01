import knex from "../database/db";
const { v4: uuidv4 } = require("uuid");

export class FindResourceCondition {
  async execute(idSumarioIntegracao, newId) {
    const queryResource = await knex.raw(`
    SELECT
    (SELECT CASE 
      WHEN cd_multi_empresa = 1 THEN 'HMSJ'
      WHEN cd_multi_empresa = 2 THEN 'PMP'
      WHEN cd_multi_empresa = 13 THEN 'HMSM'
      END
      FROM atendime
      WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento ) ||'-'|| cd_atendimento AS ID, 
      NOME_COMPLETO,
      DIAGNOSTICO,
      ID_SUMARIO_INTERNACAO,
      CPF
      FROM DBI_FHIR_SUMARIO_INTERNACAO
     WHERE id_sumario_internacao = ${idSumarioIntegracao}


    `);

    const resource = {
      resource: {
        resourceType: "Condition",
        id: queryResource[0].ID_SUMARIO_INTERNACAO,
        subject: {
          type: "Patient",
          reference: `Patient/${queryResource[0].CPF}`,
          display: queryResource[0].NOME_COMPLETO,
        },
        category: [
          {
            coding: [
              {
                display: "DIAGNOSTICO",
              },
            ],
            text: `${queryResource[0].DIAGNOSTICO}`,
          },
        ],
      },
    };
    return resource;
  }
}
