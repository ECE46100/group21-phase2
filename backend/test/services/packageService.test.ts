import PackageService from "../../src/services/packageService";
import { Package } from "../../src/models/package";
import { Version } from "../../src/models/version";
import { GroupedCountResultItem } from "sequelize";

jest.mock("../../src/models/package");
jest.mock("../../src/models/version");

const mockPackage = {
  ID: 1,
  name: "testpackage",
  contentUpload: true,
}

const mockVersion = {
  ID: 1,
  packageID: 1,
  version: "1.0.0",
  author: "testauthor",
  accessLevel: "public",
  timestamp: new Date(),
  JSProgram: "testpath",
  packageUrl: "testurl",
}

describe("PackageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPackageID', () => {
    it('should return the package ID if it exists', async () => {
      jest.spyOn(Package, 'findOne').mockResolvedValue(mockPackage as Package);

      const result = await PackageService.getPackageID('testpackage');
      expect(Package.findOne).toHaveBeenCalledWith({ where: { name: 'testpackage' } });
      expect(result).toBe(1);
    });

    it('should return null if the package does not exist', async () => {
      jest.spyOn(Package, 'findOne').mockResolvedValue(null);

      const result = await PackageService.getPackageID('testpackage');
      expect(Package.findOne).toHaveBeenCalledWith({ where: { name: 'testpackage' } });
      expect(result).toBe(null);
    });
  });

  describe('getPackageByID', () => {
    it('should return the package if it exists', async () => {
      jest.spyOn(Package, 'findByPk').mockResolvedValue(mockPackage as Package);

      const result = await PackageService.getPackageByID(1);
      expect(Package.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(mockPackage);
    });

    it('should return null if the package does not exist', async () => {
      jest.spyOn(Package, 'findByPk').mockResolvedValue(null);

      const result = await PackageService.getPackageByID(1);
      expect(Package.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(null);
    });
  });

  describe('getPackageName', () => {
    it('should return the package name if it exists', async () => {
      jest.spyOn(Package, 'findByPk').mockResolvedValue(mockPackage as Package);

      const result = await PackageService.getPackageName(1);
      expect(Package.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe('testpackage');
    });

    it('should return null if the package does not exist', async () => {
      jest.spyOn(Package, 'findByPk').mockResolvedValue(null);

      const result = await PackageService.getPackageName(1);
      expect(Package.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(null);
    });
  });

  describe('getPackageVersion', () => {
    it('should return the version if it exists', async () => {
      jest.spyOn(Version, 'findByPk').mockResolvedValue(mockVersion as Version);

      const result = await PackageService.getPackageVersion(1);
      expect(Version.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(mockVersion);
    });

    it('should return null if the version does not exist', async () => {
      jest.spyOn(Version, 'findByPk').mockResolvedValue(null);

      const result = await PackageService.getPackageVersion(1);
      expect(Version.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(null);
    });
  });

  describe('getAllVersions', () => {
    it('should return all versions of a package', async () => {
      jest.spyOn(Version, 'findAll').mockResolvedValue([mockVersion] as Version[]);

      const result = await PackageService.getAllVersions(1);
      expect(Version.findAll).toHaveBeenCalledWith({ where: { packageID: 1 }, order: [['createdAt', 'ASC']] });
      expect(result).toEqual([mockVersion]);
    });
  });

  describe('getVersionID', () => {
    it('should return the version ID if it exists', async () => {
      jest.spyOn(Version, 'findOne').mockResolvedValue(mockVersion as Version);

      const result = await PackageService.getVersionID(1, '1.0.0');
      expect(Version.findOne).toHaveBeenCalledWith({ where: { packageID: 1, version: '1.0.0' } });
      expect(result).toBe(1);
    });

    it('should return null if the version does not exist', async () => {
      jest.spyOn(Version, 'findOne').mockResolvedValue(null);

      const result = await PackageService.getVersionID(1, '1.0.0');
      expect(Version.findOne).toHaveBeenCalledWith({ where: { packageID: 1, version: '1.0.0' } });
      expect(result).toBe(null);
    });
  });

  describe("getPackagesBySemver", () => {
    const mockVersionRows = (count: number, minorVersion: number, baseID = 1) =>
      Array.from({ length: count }, (_, i) => ({
        ID: baseID + i,
        packageID: 1,
        version: `1.${minorVersion}.${i}`,
        createdAt: new Date(),
    }));

    it("should handle less than 50 results total", async () => {
      const mockVersions = mockVersionRows(30, 0);

      jest.spyOn(Package, "findOne").mockResolvedValue(mockPackage as Package);
      jest.spyOn(Version, "findAndCountAll").mockResolvedValueOnce({
        count: 30,
        rows: mockVersions,
      } as unknown as { rows: Version[], count: GroupedCountResultItem[] })
      .mockResolvedValueOnce({
        count: 0,
        rows: [],
      } as unknown as { rows: Version[], count: GroupedCountResultItem[] });

      jest.spyOn(Package, "findByPk").mockResolvedValue(mockPackage as Package);

      const result = await PackageService.getPackagesBySemver(
        [{ Name: "testpackage", Version: "~1.0.0" }],
        0,
        0,
        "public"
      );

      expect(result[0]).toBe(-1);
      expect(result[1]).toBe(-1);
      expect(result[2]).toHaveLength(30);
    });

    it("should handle 50 results on the first page", async () => {
      const mockVersions = mockVersionRows(50, 0);

      jest.spyOn(Package, "findOne").mockResolvedValue(mockPackage as Package);
      jest.spyOn(Version, "findAndCountAll").mockResolvedValue({
        count: 50,
        rows: mockVersions,
      } as unknown as { rows: Version[], count: GroupedCountResultItem[] });

      jest.spyOn(Package, "findByPk").mockResolvedValue(mockPackage as Package);

      const result = await PackageService.getPackagesBySemver(
        [{ Name: "testpackage", Version: "~1.0.0" }],
        0,
        0,
        "public"
      );

      expect(result[0]).toBe(1);
      expect(result[1]).toBe(0);
      expect(result[2]).toHaveLength(50);
    });

    it("should handle 50 results across multiple pages", async () => {
      const mockVersions1 = mockVersionRows(30, 0).concat(mockVersionRows(20, 1));
      const mockVersions2 = mockVersionRows(20, 0).concat(mockVersionRows(30, 1));

      jest.spyOn(Package, "findOne").mockResolvedValue(mockPackage as Package);
      jest.spyOn(Version, "findAndCountAll").mockResolvedValueOnce({
        count: 50,
        rows: mockVersions1,
      } as unknown as { rows: Version[], count: GroupedCountResultItem[] })
      .mockResolvedValueOnce({
        count: 50,
        rows: mockVersions2,
      } as unknown as { rows: Version[], count: GroupedCountResultItem[] })
      .mockResolvedValueOnce({
        count: 0,
        rows: [],
      } as unknown as { rows: Version[], count: GroupedCountResultItem[] });
      
      jest.spyOn(Package, "findByPk").mockResolvedValue(mockPackage as Package);

      const result = await PackageService.getPackagesBySemver(
        [{ Name: "testpackage", Version: "~1.0.0" }],
        0,
        0,
        "public"
      );

      expect(result[0]).toBe(1);
      expect(result[1]).toBe(20);
      expect(result[2]).toHaveLength(50);
    });
  });

  describe("createPackage", () => {
    it("should create a package", async () => {
      jest.spyOn(Package, "create").mockResolvedValue(undefined);

      const result = await PackageService.createPackage(mockPackage);
      expect(Package.create).toHaveBeenCalledWith(mockPackage);
      expect(result).toBe(undefined);
    });
    
    it("should throw an error if the package creation fails", async () => {
      jest.spyOn(Package, "create").mockRejectedValue("error");

      await expect(PackageService.createPackage(mockPackage)).rejects.toThrowError("error");
    });
  });

  describe("createVersion", () => {
    it("should create a version", async () => {
      jest.spyOn(Version, "findOne").mockResolvedValue(null);
      jest.spyOn(Version, "create").mockResolvedValue(undefined);

      const result = await PackageService.createVersion(mockVersion);
      expect(Version.findOne).toHaveBeenCalledWith({ where: { packageID: 1, version: "1.0.0" } });
      expect(Version.create).toHaveBeenCalledWith(mockVersion);

      expect(result).toBe(undefined);
    });

    it("should throw an error if the version already exists", async () => {
      jest.spyOn(Version, "findOne").mockResolvedValue(mockVersion as Version);

      await expect(PackageService.createVersion(mockVersion)).rejects.toThrowError("Version already exists");
    });

    it("should throw an error if the version creation fails", async () => {
      jest.spyOn(Version, "findOne").mockResolvedValue(null);
      jest.spyOn(Version, "create").mockRejectedValue("error");

      await expect(PackageService.createVersion(mockVersion)).rejects.toThrowError("error");
    });
  });
  
});