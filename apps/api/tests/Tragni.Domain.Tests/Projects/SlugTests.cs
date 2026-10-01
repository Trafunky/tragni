using Tragni.Domain.Common;
using Tragni.Domain.Projects;

namespace Tragni.Domain.Tests.Projects;

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
    [InlineData("!!!")]
    public void FromTitle_TitleWithoutUsableCharacters_ThrowsDomainException(string title)
    {
        Assert.Throws<DomainException>(() => Slug.FromTitle(title));
    }

    [Theory]
    [InlineData("MES & Interface", "mes-interface")]
    [InlineData("Node.js", "node-js")]
    [InlineData("C# / .NET", "c-net")]
    [InlineData("Projekt (2026)", "projekt-2026")]
    public void FromTitle_TitleWithDisallowedCharacters_TreatsThemAsSeparators(string title, string expected)
    {
        var slug = Slug.FromTitle(title);

        Assert.Equal(expected, slug.Value);
    }

    [Theory]
    [InlineData("Müller & Söhne", "mueller-soehne")]
    [InlineData("Übergabe", "uebergabe")]
    [InlineData("Weiß", "weiss")]
    [InlineData("Fahrzeugprüfung", "fahrzeugpruefung")]
    public void FromTitle_TitleWithGermanCharacters_TransliteratesThem(string title, string expected)
    {
        var slug = Slug.FromTitle(title);

        Assert.Equal(expected, slug.Value);
    }
}
