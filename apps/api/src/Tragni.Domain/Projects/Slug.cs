using System.Text;
using Tragni.Domain.Common;

namespace Tragni.Domain.Projects;

public sealed record Slug
{
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
        var prepared = ReplaceGermanCharacters(title.ToLowerInvariant());
        var builder = new StringBuilder();
        var separatorPending = false;


        foreach (var c in prepared)
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

    private static string ReplaceGermanCharacters(string text) =>
        text.Replace("ä", "ae")
            .Replace("ö", "oe")
            .Replace("ü", "ue")
            .Replace("ß", "ss");
}
