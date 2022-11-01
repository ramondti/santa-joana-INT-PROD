import knex from "../database/db";

//PRESTADOR ALTA MEDICA

export class FindResourcePractitioner2 {
  async execute(idSumarioIntegracao) {
    const queryResource = await knex.raw(`
    SELECT 
    profissional_alta_medica as NomeMedico,                                              
    especialidade as ESPECIALIDADE,
    (SELECT CASE 
      WHEN cd_multi_empresa = 1 THEN 'HMSJ'
      WHEN cd_multi_empresa = 2 THEN 'PMP'
      WHEN cd_multi_empresa = 13 THEN 'HMSM'
      END
      FROM atendime
      WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento ) ||'-'|| cd_atendimento AS ID,   
    tp_conselho,
    cd_uf AS UF_CRM,
    DS_CONSELHO,
    cd_prestador_alta_medica
     FROM DBI_FHIR_SUMARIO_INTERNACAO
    WHERE id_sumario_internacao = ${idSumarioIntegracao} 

    `);

    const resource = {
      resource: {
        id: `${queryResource[0].CD_PRESTADOR_ALTA_MEDICA}`,
        resourceType: "Practitioner",
        active: true,
        name: [
          {
            use: "official",
            text: `${queryResource[0].NOMEMEDICO}`,
          },
        ],
        qualification: [
          {
            identifier: [
              {
                type: {
                  text: "Especialidade",
                },
                value: `${queryResource[0].ESPECIALIDADE}`,
              },
              {
                type: {
                  text: "CRM",
                },
                value: "sem-identificacao",
              },
              {
                type: {
                  text: "TIPO_CRM",
                },
                value: `${queryResource[0].TP_CONSELHO}`,
              },
              {
                type: {
                  text: "UF_CRM",
                },
                value: `${queryResource[0].UF_CRM}`,
              },
            ],
            code: {
              text: `${queryResource[0].DS_CONSELHO}`,
            },
          },
        ],
      },
    };
    return resource;
  }
}
