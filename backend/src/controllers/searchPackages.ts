import PackageService from "../services/packageService";
import { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../utils/logUtils";
import userService from "../services/userService";

const PackageQuerySchema = z.object({
  Name: z.string().default('*'),
  Version: z.string().default('*').transform((version) => {
    if (version.includes("-")) {
      const [start, end] = version.split("-");
      return `${start.trim()} - ${end.trim()}`;
    }
    return version;
  }),
});

type ValidPackageQuery = z.infer<typeof PackageQuerySchema>;

function checkPackageQuery(query: unknown): ValidPackageQuery[] {
  // const validSemVerRegex = /^(?:\^|~)?\d+\.\d+\.\d+(?:\s*-\s*\d+\.\d+\.\d+)?$/;
  const validSemVerRegex = /^(?:\*|(?:\^|~)?\d+\.\d+\.\d+(?:\s*-\s*\d+\.\d+\.\d+)?)$/; // allow wildcard '*'(when no version is specified)

  if (!Array.isArray(query)) throw new Error("Invalid query");

  const validatedPackageQuery: ValidPackageQuery[] = [];

  for (const q of query) {
    const validatedQuery = PackageQuerySchema.safeParse(q);
    // console.log(`in searchPackages.ts/checkPackageQuery(), query is safe`); // delete this
    if (!validatedQuery.success) {
      throw new Error("Invalid query");
    }
    // console.log(`in searchPackages.ts/checkPackageQuery(), version in query : ${validatedQuery.data.Version}`); // delete this
    if (!validSemVerRegex.exec(validatedQuery.data.Version)) {
      
    // console.log(`in searchPackages.ts/checkPackageQuery(), version exec invalid`); // delete this
      throw new Error("Invalid query");
    }
    validatedPackageQuery.push(validatedQuery.data);
    // console.log(`in searchPackages.ts/checkPackageQuery(), name in query : ${validatedQuery.data.Name}`); // delete this
  }
  return validatedPackageQuery;
}

export default async function searchPackages(req: Request, res: Response) {
  logger.info(`body: , ${JSON.stringify(req.body)}`);
  const requestOffset = req.query ? req.query.offset : null;

  //stupidly hardcoded way to account for negative offset

  let splitOffset = typeof requestOffset === "string" ? requestOffset.split("-") : ["0", "0"];
  if (splitOffset.length > 2 && splitOffset[2] == '') {
    splitOffset[1] = '-' + splitOffset[1];
    splitOffset[3] = '-' + splitOffset[3];
  }
  splitOffset = splitOffset.filter(item => item !== '');  //added for neg offset
  const offsetNum = (Number(splitOffset[0]));

  if (!(!isNaN(offsetNum) && splitOffset[0].trim() !== '') || splitOffset.length > 2 || splitOffset.length === 0) {
    res.status(400).send("Invalid request");
    return;
  }

  const queryOffset = parseInt(splitOffset[0]);
  const semverOffset = splitOffset.length > 1 ? parseInt(splitOffset[1]) : 0;

  if (queryOffset < 0 || semverOffset < 0) {
    res.status(200).send([]);
    return;
  }
  try {
    // Get the current user's group
    const username = req.middleware.username;
    const userGroup = await userService.getUserGroup(username);
    
    const packageQueries = checkPackageQuery(req.body);

    const result = await PackageService.getPackagesBySemver(packageQueries, queryOffset, semverOffset, userGroup);
    // await PackageService.createHistory()
    logger.info(`offset: ${result[0]}-${result[1]}`);
    logger.info(`result: ${JSON.stringify(result[2])}`);
    res.header("offset", `${result[0]}-${result[1]}`);
    res.status(200).send(result[2]);
  } catch {
    res.status(400).send("Invalid request");
  }
}