import knex from "../database/db";

export class FindResourceProcedure {
  async execute(idSumarioIntegracao) {
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
      CPF,
      PROCEDIMENTO_REALIZADO
      FROM DBI_FHIR_SUMARIO_INTERNACAO
     WHERE id_sumario_internacao = ${idSumarioIntegracao}

    `);

    const resource = {
      resource: {
        resourceType: "Procedure",
        subject: {
          type: "Patient",
          reference: `Patient/${queryResource[0].CPF}`,
          display: queryResource[0].NOME_COMPLETO,
        },
        note: [
          {
            text: `${
              !queryResource[0].PROCEDIMENTO_REALIZADO
                ? ""
                : queryResource[0].PROCEDIMENTO_REALIZADO
            }`,
          },
        ],
      },
    };

    return resource;
  }
}
