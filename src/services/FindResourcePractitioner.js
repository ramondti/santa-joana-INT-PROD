import knex from "../database/db";

export class FindResourcePractitioner {
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
    numero_registro AS CRM,
    tipo_conselho AS TIPO_CRM,
    NOME_PROFISSIONAL,
    OCUPACAO_PROFISSIONAL,
    uf AS UF_CRM 
     FROM DBI_FHIR_SUMARIO_INTERNACAO
    WHERE id_sumario_internacao = ${idSumarioIntegracao} 

    `);

    const resource = {
      resource: {
        id: `${queryResource[0].CRM}`,
        resourceType: "Practitioner",
        active: true,
        name: [
          {
            use: "official",
            text: `${queryResource[0].NOME_PROFISSIONAL}`,
          },
        ],
        qualification: [
          {
            identifier: [
              {
                type: {
                  text: "OCUPACAO_PROFISSIONAL",
                },
                value: `${
                  !queryResource[0].OCUPACAO_PROFISSIONAL
                    ? ""
                    : queryResource[0].OCUPACAO_PROFISSIONAL
                }`,
              },
              {
                type: {
                  text: "CRM",
                },
                value: `${queryResource[0].CRM}`,
              },
              {
                type: {
                  text: "TIPO_CRM",
                },
                value: `${queryResource[0].TIPO_CRM}`,
              },
              {
                type: {
                  text: "UF_CRM",
                },
                value: `${queryResource[0].UF_CRM}`,
              },
            ],
            code: {
              text: "CRM",
            },
          },
        ],
      },
    };
    return resource;
  }
}
