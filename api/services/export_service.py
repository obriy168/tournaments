import io
import csv

class ExportService:
    async def export_tournament_leaderboard(self, leaderboard):
        sub_output = io.StringIO()

        writer = csv.writer(sub_output, delimiter=';')
        writer.writerow(['place', 'team_name', 'city', 'organization', 'score', 'submission_count'])
        for item in leaderboard:
            writer.writerow([
                item["place"], 
                item["team_name"], 
                item["city"], 
                item["organization"], 
                item["score"], 
                item["submission_count"]
            ])

        sub_output.seek(0)

        output = io.BytesIO(sub_output.getvalue().encode('utf-8'))
        output.seek(0)

        return output

        