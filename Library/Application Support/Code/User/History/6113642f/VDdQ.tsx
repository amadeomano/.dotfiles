describe('useGetOrgUnitSearchResults', () => {
it('should not call the API if searchTerm is undefined', () => {
    const { result } = renderHook(() => useGetOrgUnitSearchResults({ searchTerm: undefined }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  }
});
