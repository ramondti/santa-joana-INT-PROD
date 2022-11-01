import knex from "../database/db";

export class FindResourceLocation {
  async execute(idSumarioIntegracao) {
    const queryResource = await knex.raw(`
    SELECT 
    (SELECT CASE 
      WHEN cd_multi_empresa = 1 THEN 'HMSJ'
      WHEN cd_multi_empresa = 2 THEN 'PMP'
      WHEN cd_multi_empresa = 13 THEN 'HMSM'
      END
      FROM atendime
      WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento ) AS id,       
    CNES,
    (SELECT ds_multi_empresa FROM multi_empresas WHERE cd_multi_empresa = (SELECT cd_multi_empresa FROM atendime WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento )) AS hospital
   FROM DBI_FHIR_SUMARIO_INTERNACAO
   WHERE id_sumario_internacao = ${idSumarioIntegracao} 

    `);

    const resource = {
      resource: {
        resourceType: "Location",
        id: queryResource[0].ID,
        identifier: [
          {
            type: {
              text: "CNES",
            },
            value: `${queryResource[0].CNES}`,
          },
        ],
        type: [
          {
            text: "HOSPITAL",
          },
        ],
        name: `${queryResource[0].HOSPITAL}`,
      },
    };
    return resource;
  }
}
