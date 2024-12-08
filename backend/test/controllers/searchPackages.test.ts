import { Request, Response } from "express";
import searchPackages from "../../src/controllers/searchPackages";
import PackageService from "../../src/services/packageService";

// Mocking external dependencies
jest.mock("../../src/services/packageService");

describe("searchPackages Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: [
        {
          Name: "testPackage",
          Version: "1.0.0",
        },
      ],
      query: { offset: "0-0" }, // Explicitly defining query as an object with 'offset'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      header: jest.fn(),
    };
  });

  it("should return packages when a valid query and offset are provided", async () => {
    // Mock valid response from PackageService
    const mockResult = [[1, 0], [0, 0], [{ Name: "testPackage", Version: "1.0.0" }]];
    (PackageService.getPackagesBySemver as jest.Mock).mockResolvedValue(mockResult);

    await searchPackages(req as Request, res as Response);

    expect(PackageService.getPackagesBySemver).toHaveBeenCalledWith(
      expect.arrayContaining([{ Name: "testPackage", Version: "1.0.0" }]),
      0,
      0
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.header).toHaveBeenCalledWith("offset", "1-0");
    expect(res.send).toHaveBeenCalledWith([{ Name: "testPackage", Version: "1.0.0" }]);
  });

  it("should return 400 if the offset query is invalid", async () => {
    // Invalid offset format
    if (req.query !== undefined) { req.query.offset = "invalidOffset"; }

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return 400 if the query is empty or invalid", async () => {
    // Empty query
    req.body = [];

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return 400 if an invalid version is provided", async () => {
    // Invalid version format
    req.body = [{ Name: "testPackage", Version: "invalidVersion" }];

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return 404 if no packages match the query", async () => {
    // Mock an empty result (no packages found)
    (PackageService.getPackagesBySemver as jest.Mock).mockResolvedValue([[], [], []]);

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("No packages found");
  });
});
