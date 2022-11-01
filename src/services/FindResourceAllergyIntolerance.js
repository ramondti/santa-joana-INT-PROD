import knex from "../database/db";

export class FindResourceAllergyIntolerance {
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
      CD_PACIENTE,
      CPF,
      NOME_COMPLETO,
      categoria_agente,
      (CASE WHEN SEXO = 'F' THEN 'female' ELSE 'masculine' END) AS SEXO,
      To_Char(DATA_NASCIMENTO, 'MMMM-MM-DD')||'T'||(To_Char(DATA_NASCIMENTO, 'HH24:MI:SS')) AS DATA_NASCIMENTO
      FROM DBI_FHIR_SUMARIO_INTERNACAO
     WHERE id_sumario_internacao = ${idSumarioIntegracao}
    `);

    const resource = {
      resource: {
        resourceType: "AllergyIntolerance",
        patient: {
          type: "Patient",
          reference: `Patient/${queryResource[0].CPF}`,
          display: queryResource[0].NOME_COMPLETO,
        },
        reaction: [
          {
            manifestation: [
              {
                text: `${queryResource[0].CATEGORIA_AGENTE}`,
              },
            ],
          },
        ],
      },
    };
    return resource;
  }
}
