import PackageService from "../services/packageService";
import { PackageQuery } from "../services/packageService";
import { Request, Response } from "express";

function checkPackageQuery(query: any): query is PackageQuery {
  return typeof query.Name === "string" && typeof query.Version === "string";
}

export default async function searchPackages(req: Request, res: Response) {
  const requestOffset = req.query ? req.query.offset : null;
  const splitOffset = typeof requestOffset === "string" ? requestOffset.split("-") : ["0", "0"];
  const queryOffset = parseInt(splitOffset[0]);
  const semverOffset = splitOffset.length > 1 ? parseInt(splitOffset[1]) : 0;

  if (queryOffset < 0 || semverOffset < 0) {
    res.status(200).send([]);
    return;
  }

  const packageQueries = req.body;
  if (!Array.isArray(packageQueries) || !packageQueries.every(checkPackageQuery)) {
    res.status(400).send("Invalid request");
    return;
  }

  const result = await PackageService.getPackagesBySemver(packageQueries, queryOffset, semverOffset);
  res.header("offset", `${result[0]}-${result[1]}`);
  res.status(200).send(result[2]);
}

