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
}
