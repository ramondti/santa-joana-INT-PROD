import knex from "../database/db";

export class FindResourcePatient {
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
      ID_SUMARIO_INTERNACAO,
      CPF,
      NOME_COMPLETO,
      (CASE WHEN SEXO = 'F' THEN 'female' ELSE 'masculine' END) AS SEXO,
      To_Char(DATA_NASCIMENTO, 'YYYY-MM-DD')||'T'||(To_Char(DATA_NASCIMENTO, 'HH24:MI:SS')) AS DATA_NASCIMENTO
      FROM DBI_FHIR_SUMARIO_INTERNACAO
     WHERE id_sumario_internacao = ${idSumarioIntegracao}
    `);

    const nomeCompleto = queryResource[0].NOME_COMPLETO;
    const nomeArray = nomeCompleto.split(" ");
    var nomeFinal = "";

    nomeArray.forEach((nome) => {
      if (nome.charAt(0)) {
        nomeFinal += nome.charAt(0);
      }
    });

    const random = Math.floor(Math.random() * 99999999999 + 11111111111);

    const resource = {
      resource: {
        id: `${queryResource[0].CD_PACIENTE}`,
        resourceType: "Patient",
        identifier: [
          {
            type: {
              text: "CD_PACIENTE",
            },
            value: `${queryResource[0].CD_PACIENTE}`,
          },
          {
            type: {
              text: "CPF",
            },
            value: `${queryResource[0].CPF}`,
          },
        ],
        name: [
          {
            use: "official",
            text: nomeFinal,
          },
        ],
        gender: queryResource[0].SEXO,
        birthDate: queryResource[0].DATA_NASCIMENTO,
      },
    };
    return resource;
  }
}
