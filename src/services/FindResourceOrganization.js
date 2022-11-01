import knex from "../database/db";

export class FindResourceOrganization {
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
    (SELECT nr_cgc FROM convenio WHERE cd_convenio =  (SELECT cd_convenio FROM atendime WHERE cd_Atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento)) AS CNPJ
    FROM DBI_FHIR_SUMARIO_INTERNACAO
   WHERE id_sumario_internacao = ${idSumarioIntegracao} 
    `);

    const resource = {
      resource: {
        resourceType: "Organization",
        id: `${queryResource[0].CNPJ}`,
        identifier: [
          {
            type: {
              text: "CNPJ",
            },
            value: `${queryResource[0].CNPJ}`,
          },
        ],
        type: [
          {
            text: "CONVENIO",
          },
        ],
      },
    };
    return resource;
  }
}
