import PackageService from "../services/packageService";
import { Request, Response } from "express";
import { z } from "zod";

const PackageQuerySchema = z.object({
  Name: z.string(),
  Version: z.string().transform((version) => {
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

  for (const q of query) { // perhaps cause error when empty result  
    const validatedQuery = PackageQuerySchema.safeParse(q);
    console.log(`in searchPackages.ts/checkPackageQuery(), query is safe`); // delete this
    if (!validatedQuery.success) {
      throw new Error("Invalid query");
    }
    console.log(`in searchPackages.ts/checkPackageQuery(), version in query : ${validatedQuery.data.Version}`); // delete this
    if (!validSemVerRegex.exec(validatedQuery.data.Version)) {
      
    console.log(`in searchPackages.ts/checkPackageQuery(), version exec invalid`); // delete this
      throw new Error("Invalid query");
    }
    validatedPackageQuery.push(validatedQuery.data);
    console.log(`in searchPackages.ts/checkPackageQuery(), name in query : ${validatedQuery.data.Name}`); // delete this
  }
  return validatedPackageQuery;
}

export default async function searchPackages(req: Request, res: Response) {
  const requestOffset = req.query ? req.query.offset : null;
  const splitOffset = typeof requestOffset === "string" ? requestOffset.split("-") : ["0", "0"];
  if (Number.isNaN(splitOffset[0]) || splitOffset.length > 2 || splitOffset.length === 0) {
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
    const packageQueries = checkPackageQuery(req.body); // perhaps cause error when no result

    const result = await PackageService.getPackagesBySemver(packageQueries, queryOffset, semverOffset);
    res.header("offset", `${result[0]}-${result[1]}`);
    res.status(200).send(result[2]);
  } catch {
    res.status(400).send("Invalid request");
  }
}

