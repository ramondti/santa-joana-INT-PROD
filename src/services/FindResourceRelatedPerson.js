import knex from "../database/db";

export class FindResourceRelatedPerson {
  async execute(idSumarioIntegracao) {
    const queryResource = await knex.raw(`
    SELECT
    (SELECT CASE 
      WHEN cd_multi_empresa = 1 THEN 'HMSJ'
      WHEN cd_multi_empresa = 2 THEN 'PMP'
      WHEN cd_multi_empresa = 13 THEN 'HMSM'
      END
      FROM atendime
      WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento ) ||'-'|| cd_atendimento AS id,
      cpf ||'-RP' as paciente,
      nome_completo_mae,
      nome_completo,
      CPF
      FROM DBI_FHIR_SUMARIO_INTERNACAO
     WHERE id_sumario_internacao = ${idSumarioIntegracao}  
    `);

    const resource = {
      resource: {
        id: `${queryResource[0].PACIENTE}`,
        resourceType: "RelatedPerson",
        patient: {
          type: "Patient",
          reference: `Patient/${queryResource[0].CPF}`,
          display: queryResource[0].NOME_COMPLETO,
        },
        relationship: [
          {
            text: "mae",
          },
        ],
        name: [
          {
            use: "official",
            text: queryResource[0].NOME_COMPLETO_MAE,
          },
        ],
        language: {
          text: "portuguese",
        },
      },
    };
    return resource;
  }
}
