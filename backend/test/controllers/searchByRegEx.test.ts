import { Request, Response } from "express";
import searchByRegex from "../../src/controllers/searchByRegEx";
import PackageService from "../../src/services/packageService";
import userService from "../../src/services/userService";

jest.mock("../../src/services/packageService");
jest.mock("../../src/services/userService");

describe("searchByRegex Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {}, // Default empty body, will set for each test
      middleware: {
        username: 'testuser',
        permissions: { uploadPerm: true, downloadPerm: true, searchPerm: true, adminPerm: false }, // Mock permissions
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("should return packages when a valid regex query is provided", async () => {
    const regex = "test"; // Valid regex
    req.body = { RegEx: regex };

    // Mocking userService and PackageService
    const userGroup = "testGroup";
    (userService.getUserGroup as jest.Mock).mockResolvedValue(userGroup);

    const mockPackages = [
      { id: 1, name: "testPackage1" },
      { id: 2, name: "testPackage2" },
    ];
    (PackageService.getPackagesByRegex as jest.Mock).mockResolvedValue(mockPackages);

    await searchByRegex(req as Request, res as Response);

    expect(PackageService.getPackagesByRegex).toHaveBeenCalledWith(regex, userGroup);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockPackages);
  });

  it("should return 404 if no packages are found", async () => {
    const regex = "nonExistent";
    req.body = { RegEx: regex };

    const userGroup = "testGroup";
    (userService.getUserGroup as jest.Mock).mockResolvedValue(userGroup);
    (PackageService.getPackagesByRegex as jest.Mock).mockResolvedValue([]);

    await searchByRegex(req as Request, res as Response);

    expect(PackageService.getPackagesByRegex).toHaveBeenCalledWith(regex, userGroup);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("No packages found");
  });

  it("should return 400 if the regex is invalid", async () => {
    const invalidRegex = "["; // Invalid regex

    req.body = { RegEx: invalidRegex };

    await searchByRegex(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return 400 if the regex query is missing", async () => {
    req.body = {}; // Empty body, missing RegEx

    await searchByRegex(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return 400 if the regex query is an empty string", async () => {
    req.body = { RegEx: "" }; // Empty string as regex

    await searchByRegex(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should handle errors thrown by PackageService", async () => {
    const regex = "test"; // Valid regex
    req.body = { RegEx: regex };

    const userGroup = "testGroup";
    (userService.getUserGroup as jest.Mock).mockResolvedValue(userGroup);

    // Mocking PackageService to throw an error
    (PackageService.getPackagesByRegex as jest.Mock).mockRejectedValue(new Error("Service error"));

    await searchByRegex(req as Request, res as Response);

    expect(PackageService.getPackagesByRegex).toHaveBeenCalledWith(regex, userGroup);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });
});
