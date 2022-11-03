import knex from "../database/db";

export class FindResourceEncounter {
  async execute(idSumarioIntegracao, newId, newId2) {
    const queryResource = await knex.raw(`

    SELECT
    (SELECT CASE 
      WHEN cd_multi_empresa = 1 THEN 'HMSJ'
      WHEN cd_multi_empresa = 2 THEN 'PMP'
      WHEN cd_multi_empresa = 13 THEN 'HMSM'
      END
      FROM atendime
      WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento ) AS id, 
      CD_ATENDIMENTO,
      NOME_COMPLETO,
      ID_SUMARIO_INTERNACAO,
      CPF,
      CD_PACIENTE,
      PROFISSIONAL_ALTA_MEDICA,
      NOME_PROFISSIONAL,
      (SELECT nr_cgc FROM convenio WHERE cd_convenio =  (SELECT cd_convenio FROM atendime WHERE cd_Atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento)) AS CNPJ,
      numero_registro AS CRM,
      (SELECT ds_multi_empresa FROM multi_empresas WHERE cd_multi_empresa = (SELECT cd_multi_empresa FROM atendime WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento )) AS HOSPITAL,
      profissional_alta_medica,
      cd_prestador_alta_medica,
      (SELECT nm_convenio FROM convenio WHERE cd_convenio = (SELECT cd_convenio FROM atendime WHERE cd_atendimento = DBI_FHIR_SUMARIO_INTERNACAO.cd_atendimento)) AS NOME_CONVENIO,
      (CASE WHEN DATA_HORA_ATENDIMENTO IS NOT NULL THEN To_Char(DATA_HORA_ATENDIMENTO, 'YYYY-MM-DD')||'T'||(To_Char(DATA_HORA_ATENDIMENTO, 'HH24:MI:SS')) ELSE NULL END) AS INICIO,
      (CASE WHEN DATA_ALTA_MEDICA IS NOT NULL THEN To_Char(DATA_ALTA_MEDICA, 'YYYY-MM-DD')||'T'||(To_Char(DATA_ALTA_MEDICA, 'HH24:MI:SS')) ELSE '' END) AS FIM
      FROM DBI_FHIR_SUMARIO_INTERNACAO
     WHERE id_sumario_internacao = ${idSumarioIntegracao}


    `);

    const resource = {
      resource: {
        resourceType: "Encounter",
        identifier: [
          {
            type: {
              text: "CD_ATENDIMENTO",
            },
            value: `${queryResource[0].CD_ATENDIMENTO}`,
          },
        ],
        type: [
          {
            text: "HOSPITALAR",
          },
        ],
        subject: {
          type: "Patient",
          reference: `Patient/${queryResource[0].CD_PACIENTE}`,
          display: queryResource[0].NOME_COMPLETO,
        },
        reasonReference: [
          {
            reference: `Condition/${queryResource[0].ID_SUMARIO_INTERNACAO}`,
            type: "Condition",
          },
        ],
        period: {
          start: queryResource[0].INICIO,
          end: queryResource[0].FIM,
        },
        status: "finished",
        participant: [
          {
            type: [
              {
                text: "PROFISSIONAL_ADMISSAO",
              },
            ],
            individual: {
              reference: `Practitioner/${queryResource[0].CRM}`,
              type: "Practitioner",
              display: queryResource[0].NOME_PROFISSIONAL,
            },
          },
          {
            type: [
              {
                text: "PROFISSIONAL_ALTA",
              },
            ],
            individual: {
              reference: `Practitioner/${queryResource[0].CD_PRESTADOR_ALTA_MEDICA}`,
              type: "Practitioner",
              display: `${queryResource[0].PROFISSIONAL_ALTA_MEDICA}`,
            },
          },
        ],
        diagnosis: [
          {
            condition: {
              reference: `Condition/${queryResource[0].ID_SUMARIO_INTERNACAO}`,
              type: "Condition",
            },
            use: {
              text: "Desfecho",
            },
          },
        ],
        location: [
          {
            location: {
              reference: `Location/${queryResource[0].ID}`,
              type: "Location",
              display: queryResource[0].HOSPITAL,
            },
          },
        ],
        serviceProvider: {
          reference: `Organization/${queryResource[0].CNPJ}`,
          type: "Organization",
          display: `${queryResource[0].NOME_CONVENIO}`,
        },
      },
    };
    return resource;
  }
}
