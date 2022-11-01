import "dotenv/config";
import knex from "knex";
import Oracle from "oracledb";

Oracle.initOracleClient({ libDir: process.env.ORACLE_DIR });

export default knex({
  client: "oracledb",
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
    pool: {
      min: 1,
      max: 3,
    },
  },
});
