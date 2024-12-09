import PackageService from "../services/packageService";
import { Request, Response } from "express";
import userService from "../services/userService";
import { z } from "zod";

// Schema for validating the regex query
const RegexQuerySchema = z.object({
  RegEx: z.string().min(1), // Ensure the regex is a non-empty string
});

type ValidRegexQuery = z.infer<typeof RegexQuerySchema>;

// Function to validate the regex query
function validateRegexQuery(query: unknown): ValidRegexQuery {
  const validatedQuery = RegexQuerySchema.safeParse(query);

  if (!validatedQuery.success) {
    throw new Error("Invalid regex query");
  }

  // Test if the regex is valid
  try {
    new RegExp(validatedQuery.data.RegEx); // Throws an error if the regex is invalid
  } catch (err) {
    throw new Error("Invalid regex");
  }

  return validatedQuery.data;
}

/**
 * Function to search for packages by regex
 * @param req : Request
 * @param res : Response
 * @returns : 200 if the packages were found
 */
export default async function searchByRegex(req: Request, res: Response) {
  try {
    // Validate the regex query from the request body
    console.log(req.body);
    const { RegEx } = validateRegexQuery(req.body);

    // Get the current user's group
    const username = req.middleware.username;
    const userGroup = await userService.getUserGroup(username);

    // Query the database using PackageService
    const result = await PackageService.getPackagesByRegex(RegEx, userGroup);
    console.log(result);
    if (result.length === 0) {
      res.status(404).send("No packages found");
      return
    }
    // Return the result as the response
    res.status(200).send(result);
  } catch (err) {
    // Handle validation or query errors
    res.status(400).send("Invalid request");
  }
}
