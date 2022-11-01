import knex from "../database/db";

export class FindResourceComposition {
  async execute(idSumarioIntegracao) {
    const queryResource = await knex.raw(`
    SELECT
    (SELECT 
    CASE                                                         
    WHEN cd_multi_empresa = 1 THEN 'SANTA JOANA'
    WHEN cd_multi_empresa = 2 THEN 'PMP'
    WHEN cd_multi_empresa = 13 THEN 'HMSM'
    END AS sigla
    FROM atendime
    WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento)
     AS display,
     (SELECT CASE 
       WHEN cd_multi_empresa = 1 THEN 'HMSJ'
       WHEN cd_multi_empresa = 2 THEN 'PMP'
       WHEN cd_multi_empresa = 13 THEN 'HMSM'
       END
       FROM atendime
       WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento ) ||'-'|| cd_atendimento as id,
    To_Char(data_hora_atendimento, 'YYYY-MM-DD') AS data 
    FROM DBI_FHIR_SUMARIO_INTERNACAO
    WHERE id_sumario_internacao = ${idSumarioIntegracao} 
    `);

    const resource = {
      resource: {
        resourceType: "Composition",
        status: "final",
        type: {
          text: "SUMÁRIO DE INTERNAÇÃO",
        },
        title: "SUMÁRIO DE INTERNAÇÃO",
        author: [
          {
            type: "Organization",
            reference: `Organization/${queryResource[0].ID}`,
            display: `${queryResource[0].DISPLAY}`,
          },
        ],
        date: queryResource[0].DATA,
      },
    };
    return resource;
  }
}
