namespace Tragni.Domain.Tests.Projects;

using Tragni.Domain.Projects;
using Tragni.Domain.Common;

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

    [Fact]
    public void FromTitle_NullTitle_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => Slug.FromTitle(null!));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void FromTitle_TitleWithoutUsableCharacters_ThrowsDomainException(string title)
    {
        Assert.Throws<DomainException>(() => Slug.FromTitle(title));
    }
}
