namespace Tragni.Domain.Tests.Projects;

using Tragni.Domain.Projects;

public class SlugTests
{
    [Theory]
    [InlineData("Portfolio", "portfolio")]
    [InlineData("MES Interface", "mes-interface")]
    [InlineData("MES  Interface", "mes-interface")]
    [InlineData(" MES Interface ", "mes-interface")]
    [InlineData("MES Interface Documentation", "mes-interface-documentation")]
    public void FromTitle_ReturnsLowercaseWordsJoinedBySingleHyphens(string title, string expected)
    {
        var slug = Slug.FromTitle(title);

        Assert.Equal(expected, slug.Value);
    }
}
