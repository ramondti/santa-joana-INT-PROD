import knex from "../database/db";

export class FindResourceMedicationRequest {
  async execute(cd_atendimento) {
    const queryResource = await knex.raw(`

    SELECT DISTINCT  
    nome_completo AS display,
    anvisa AS code,
    forma_aplicacao AS method,                                                                                                                     
    qt_presc AS Value,                                                                                      
    unid_presc AS unit,
    observacao AS text,
    CPF
    FROM DBINTEGRA.DBI_FHIR_SUMARIO_INTERNACAO internacao
    left JOIN dbintegra.dbi_fhir_medicamento_adm medicamento ON medicamento.cd_atendimento = internacao.cd_atendimento
    WHERE internacao.cd_atendimento = ${cd_atendimento}
     

    `);

    var resource = [];

    queryResource.forEach((element) => {
      resource.push({
        resource: {
          resourceType: "MedicationRequest",
          status: "completed",
          subject: {
            type: "Patient",
            reference: `Patient/${element.CPF}`,
            display: queryResource[0].DISPLAY,
          },
          dosageInstruction: {
            text: `${!element.TEXT ? "" : element.TEXT}`,
            site: {
              coding: [
                {
                  system: `https://consultas.anvisa.gov.br/#/bulario/q/?numeroRegistro=${element.CODE}`,
                  code: `${element.CODE}`,
                },
              ],
            },
            method: {
              text: `${element.METHOD}`,
            },
            doseAndRate: [
              {
                dose: {
                  value: element.VALUE,
                  unit: `${element.UNIT}`,
                },
              },
            ],
          },
        },
      });
    });

    // const resource1 = {
    //   resource: {
    //     resourceType: "MedicationRequest",
    //     status: "completed",
    //     subject: {
    //       type: "Patient",
    //       reference: `Patient/${queryResource[0].ID}`,
    //       display: nomeFinal,
    //     },
    //     dosageInstruction: {
    //       text: null, //"SIMETICONA 40mg Comp - EMS",
    //       site: {
    //         coding: [
    //           {
    //             system: null, //"https://consultas.anvisa.gov.br/#/bulario/q/?numeroRegistro=17390000900",
    //             code: null, //"17390000900"
    //           },
    //         ],
    //       },
    //       method: {
    //         text: null,
    //       },
    //     },
    //   },
    // };
    return resource;
  }
}
