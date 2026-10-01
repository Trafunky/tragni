namespace Tragni.Domain.Tests.Projects;

using Tragni.Domain.Projects;

public class SlugTests
{
    [Fact]
    public void FromTitle_TitleWithUppercaseLetters_ReturnsLowercaseSlug()
    {
        var slug = Slug.FromTitle("Portfolio");

        Assert.Equal("portfolio", slug.Value);
    }
    [Fact]
    public void FromTitle_TitleWithSpaces_ReplacesSpacesWithHyphens()
    {
        var slug = Slug.FromTitle("MES Interface");

        Assert.Equal("mes-interface", slug.Value);
    }

    [Fact]
    public void FromTitle_TitleSurroundedBySpaces_ReturnsSlugWithoutEdgeHyphens()
    {
        var slug = Slug.FromTitle(" MES Interface ");
        Assert.Equal("mes-interface", slug.Value);
    }
}
