import PackageService from "../services/packageService";
import { Request, Response } from "express";
import { z } from "zod";

// Define the schema for validating the regex query
const RegexQuerySchema = z.object({
  regex: z.string().nonempty(), // Ensure it's a non-empty string
});

type ValidRegexQuery = z.infer<typeof RegexQuerySchema>;

function validateRegexQuery(query: unknown): ValidRegexQuery {
  const validatedQuery = RegexQuerySchema.safeParse(query);
  if (!validatedQuery.success) {
    throw new Error("Invalid regex query");
  }
  try {
    new RegExp(validatedQuery.data.regex); // Test if the regex is valid
  } catch (err) {
    throw new Error("Invalid regex");
  }
  return validatedQuery.data;
}

export default async function searchByRegEx(req: Request, res: Response) {
  try {
    // Validate the query from the request body
    const { regex } = validateRegexQuery(req.body);

    // Parse pagination (offsets) from the query parameters
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

    // Query the database via the PackageService
    const result = await PackageService.getPackagesByRegex(regex, queryOffset, semverOffset);

    // Set headers and send response
    res.header("offset", `${result[0]}-${result[1]}`);
    res.status(200).send(result[2]);
  } catch (err) {
    res.status(400).send("Invalid request");
  }
}
