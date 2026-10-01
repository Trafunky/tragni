using System.Globalization;
using System.Text;
using Tragni.Domain.Common;

namespace Tragni.Domain.Projects;

public sealed record Slug
{
    private const int MaxLength = 100;

    private Slug(string value) => Value = value;

    public string Value { get; }

    public static Slug FromTitle(string title)
    {
        ArgumentNullException.ThrowIfNull(title);

        var value = Normalise(title);

        if (value.Length == 0)
        {
            throw new DomainException(
                "A title must contain at least one character that can be used in a slug.");
        }

        return new Slug(value);
    }

    public override string ToString() => Value;

    private static string Normalise(string title)
    {
        var lower = title.ToLowerInvariant();
        var withGermanReplaced = ReplaceGermanCharacters(lower);
        var withoutDiacritics = RemoveDiacritics(withGermanReplaced);
        var joined = JoinAllowedCharacters(withoutDiacritics);

        return Truncate(joined);
    }

    private static string ReplaceGermanCharacters(string text) =>
        text.Replace("ä", "ae")
            .Replace("ö", "oe")
            .Replace("ü", "ue")
            .Replace("ß", "ss");

    private static string RemoveDiacritics(string text)
    {
        var decomposed = text.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);

        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(c);
            }
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    private static string JoinAllowedCharacters(string text)
    {
        var builder = new StringBuilder(text.Length);
        var separatorPending = false;

        foreach (var c in text)
        {
            if (char.IsAsciiLetterOrDigit(c))
            {
                if (separatorPending && builder.Length > 0)
                {
                    builder.Append('-');
                }

                separatorPending = false;
                builder.Append(c);
            }
            else
            {
                separatorPending = true;
            }
        }

        return builder.ToString();
    }

    private static string Truncate(string text)
    {
        if (text.Length <= MaxLength)
        {
            return text;
        }

        var truncated = text[..MaxLength];
        var lastHyphenIndex = truncated.LastIndexOf('-');

        if (lastHyphenIndex > 0)
        {
            truncated = truncated[..lastHyphenIndex];
        }

        return truncated.TrimEnd('-');
    }
}
